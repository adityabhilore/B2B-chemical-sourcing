import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireAdmin, requireCustomer } from '../../middleware/authorise.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { badRequest, conflict, notFound } from '../../utils/AppError.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { parsePagination, buildMeta } from '../../utils/pagination.js';
import { notifyEmail } from '../../utils/notify.js';
import { adminNewOrderAlert } from '../../templates/email/templates.js';

const router = Router();
const orderInput = z.object({
  items: z.array(z.object({ productId: z.string().min(1), variantId: z.string().min(1), quantity: z.coerce.number().int().positive() })).min(1).max(50),
  deliveryState: z.string().trim().min(2).max(100), notes: z.string().trim().max(2000).optional().default(''),
  shippingAddress: z.object({ name:z.string().trim().min(2).max(100), phone:z.string().trim().min(6).max(20), line1:z.string().trim().min(3).max(200), line2:z.string().trim().max(200).optional(), city:z.string().trim().min(2).max(100), state:z.string().trim().min(2).max(100), pincode:z.string().trim().min(5).max(10) }),
  idempotencyKey: z.string().uuid().optional(),
});
const statusInput = z.object({ status:z.enum(['CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED']), note:z.string().trim().max(1000).optional(), confirmedTotal:z.coerce.number().nonnegative().optional() });
const transitions = { PENDING:['CONFIRMED','CANCELLED'], CONFIRMED:['PROCESSING','CANCELLED'], PROCESSING:['SHIPPED','CANCELLED'], SHIPPED:['DELIVERED'], DELIVERED:[], CANCELLED:[] };
const orderIncludes = { user:{select:{id:true,fullName:true,email:true,phone:true,profile:{select:{companyName:true}}}}, items:true, statusHistory:{orderBy:{createdAt:'asc'}}, notificationLogs:{orderBy:{createdAt:'desc'}} };
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;

router.post('/order-request', authenticate, requireCustomer, validate(orderInput), asyncHandler(async(req,res)=>{
  const {items,deliveryState,notes,shippingAddress,idempotencyKey}=req.body;
  if(idempotencyKey){const old=await prisma.orderRequest.findUnique({where:{idempotencyKey},include:{items:true}});if(old){if(old.userId!==req.user.id)throw conflict('Idempotency key has already been used');return sendSuccess(res,{order:old},'Order request already received',200);}}
  const productIds=[...new Set(items.map(i=>i.productId))];
  const products=await prisma.product.findMany({where:{id:{in:productIds},status:'ACTIVE',deletedAt:null},include:{brand:{select:{name:true}},manufacturer:{select:{name:true}},manufacturerCompany:{select:{name:true}},sellerCompany:{select:{name:true}},supplierCompany:{select:{name:true}},supplier:{select:{name:true}},variants:true}});
  if(products.length!==productIds.length)throw badRequest('One or more products are unavailable');
  const mapped=[];let total=0;let quoteRequired=false;
  for(const item of items){const p=products.find(x=>x.id===item.productId);const v=p.variants.find(x=>x.id===item.variantId&&x.isActive);if(!v)throw badRequest(`Selected variant is unavailable for ${p.name}`);if(item.quantity<Math.max(1,v.moq,p.minOrderQuantity))throw badRequest(`${p.name} quantity is below the minimum order quantity`);if(v.stockStatus==='OUT_OF_STOCK'||(p.trackStock&&p.stockQuantity!=null&&p.stockQuantity<item.quantity))throw badRequest(`${p.name} does not have the requested quantity available`);const price=v.pricingMode==='FIXED'?v.price:(v.pricingMode==='REQUEST_QUOTE'?null:(p.pricingMode==='FIXED'?p.basePrice:null));if(price==null)quoteRequired=true;else total+=Number(price)*item.quantity;
    mapped.push({quantity:item.quantity,snapshotProductName:p.name,snapshotVariantSku:v.sku,snapshotVariantLabel:v.name||v.label,snapshotPackaging:[v.packageSize,v.packageUnit].filter(Boolean).join(' ')||v.label,snapshotBrand:p.brand?.name||null,snapshotManufacturer:p.manufacturerCompany?.name||p.manufacturer?.name||null,snapshotSeller:p.sellerCompany?.name||null,snapshotSource:{sourceType:p.sourceType,supplierName:p.supplierCompany?.name||p.supplier?.name||null,supplierCompanyId:p.supplierCompanyId||null,supplierId:p.supplierId||null},snapshotPrice:price,snapshotCurrency:v.currency,snapshotUnit:v.unit,snapshotAttributes:v.attributes||{},lineTotal:price==null?null:Number(price)*item.quantity,variantId:v.id});
  }
  const now=new Date();const y=now.getFullYear();let order;
  try { order=await prisma.$transaction(async tx=>{const sequence=await tx.orderRequest.count({where:{createdAt:{gte:new Date(y,0,1),lt:new Date(y+1,0,1)}}});const orderNumber=`CHM-${y}-${String(sequence+1).padStart(6,'0')}`;const created=await tx.orderRequest.create({data:{orderNumber,userId:req.user.id,shippingAddress,deliveryState,notes:notes||null,idempotencyKey:idempotencyKey||null,estimatedTotal:quoteRequired?null:total,items:{create:mapped},statusHistory:{create:{fromStatus:null,toStatus:'PENDING',changedBy:'SYSTEM',note:'Order request submitted'}}},include:{items:true}});return created;},{isolationLevel:'Serializable'}); }
  catch(error){if(error.code==='P2002'&&idempotencyKey){const old=await prisma.orderRequest.findUnique({where:{idempotencyKey},include:{items:true}});if(old?.userId===req.user.id)return sendSuccess(res,{order:old},'Order request already received',200);}throw error;}
  const adminUrl=`${process.env.CLIENT_ORIGIN||'http://localhost:5173'}/admin/orders/${order.id}`;
  try { await notifyEmail({to:adminEmail,subject:`[Chemical Market] New order request ${order.orderNumber}`,html:adminNewOrderAlert({orderId:order.orderNumber,customerName:req.user.fullName,customerEmail:req.user.email,itemCount:mapped.length,adminOrderUrl:adminUrl}).html,templateId:'ORDER_REQUEST_ADMIN',userId:req.user.id,relatedEntity:'OrderRequest',relatedEntityId:order.id,orderRequestId:order.id}); } catch(error){console.error('[orders] Admin notification failed',error.message);}
  const waNumber=(process.env.ADMIN_WHATSAPP_NUMBER||'').replace(/\D/g,'');const waText=encodeURIComponent(`New order request ${order.orderNumber} from ${req.user.fullName}: ${mapped.length} item(s). ${adminUrl}`);const whatsappUrl=waNumber?`https://wa.me/${waNumber}?text=${waText}`:null;
  if(whatsappUrl)try{await prisma.notificationLog.create({data:{channel:'WHATSAPP',status:'SENT',recipient:waNumber,templateId:'ORDER_REQUEST_WHATSAPP_LINK',body:whatsappUrl,userId:req.user.id,relatedEntity:'OrderRequest',relatedEntityId:order.id,orderRequestId:order.id,sentAt:new Date()}});}catch(error){console.error('[orders] WhatsApp link log failed',error.message);}
  return sendSuccess(res,{order:{...order,priceStatus:quoteRequired?'Quote required':'Estimate available'}},'Order request submitted',201);
}));

router.get('/admin',authenticate,requireAdmin,asyncHandler(async(req,res)=>{const {skip,take,page,limit}=parsePagination(req.query);const where={...(req.query.status?{status:String(req.query.status)}:{}),...(req.query.customer?{userId:String(req.query.customer)}:{}),...(req.query.from||req.query.to?{createdAt:{...(req.query.from?{gte:new Date(String(req.query.from))}:{}),...(req.query.to?{lte:new Date(String(req.query.to))}:{})}}:{})};const [orders,total]=await Promise.all([prisma.orderRequest.findMany({where,skip,take,orderBy:{createdAt:'desc'},include:{user:{select:{id:true,fullName:true,email:true,phone:true}},items:{select:{id:true,snapshotProductName:true,quantity:true}}}}),prisma.orderRequest.count({where})]);sendSuccess(res,{orders,meta:buildMeta({page,limit,total})});}));
router.get('/admin/:id',authenticate,requireAdmin,asyncHandler(async(req,res)=>{const order=await prisma.orderRequest.findUnique({where:{id:req.params.id},include:orderIncludes});if(!order)throw notFound('Order not found');sendSuccess(res,{order});}));
router.patch('/admin/:id/status',authenticate,requireAdmin,validate(statusInput),asyncHandler(async(req,res)=>{const order=await prisma.orderRequest.findUnique({where:{id:req.params.id}});if(!order)throw notFound('Order not found');if(!transitions[order.status]?.includes(req.body.status))throw conflict(`Cannot move an order from ${order.status} to ${req.body.status}`);if(req.body.status==='CONFIRMED'&&order.estimatedTotal==null&&req.body.confirmedTotal==null)throw badRequest('Enter a confirmed total for quote requests');const updated=await prisma.$transaction(async tx=>{const value=await tx.orderRequest.update({where:{id:order.id},data:{status:req.body.status,...(req.body.confirmedTotal!==undefined?{confirmedTotal:req.body.confirmedTotal}:{})}});await tx.orderStatusHistory.create({data:{orderRequestId:order.id,fromStatus:order.status,toStatus:req.body.status,changedBy:req.user.id,note:req.body.note||null}});return value;});sendSuccess(res,{order:updated},'Order status updated');}));
router.post('/admin/notifications/:id/retry',authenticate,requireAdmin,asyncHandler(async(req,res)=>{const {retryNotification}=await import('../../utils/notify.js');const result=await retryNotification(req.params.id);sendSuccess(res,result,result.ok?'Notification sent':'Notification retry failed');}));
export default router;
