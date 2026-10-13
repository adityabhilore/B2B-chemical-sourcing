import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireAdmin } from "../../middleware/authorise.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import { notFound, badRequest } from "../../utils/AppError.js";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/me", asyncHandler(async (req, res) => {
  sendSuccess(res, { user: { id: req.user.id, email: req.user.email, role: req.user.role } });
}));

router.get('/dashboard',asyncHandler(async(_req,res)=>{const now=new Date();const start=new Date(now);start.setDate(start.getDate()-29);start.setHours(0,0,0,0);const [products,categories,brands,customers,orders,pending,grouped,recent,periodOrders]=await Promise.all([prisma.product.count({where:{deletedAt:null}}),prisma.category.count(),prisma.brand.count(),prisma.user.count({where:{role:'CUSTOMER'}}),prisma.orderRequest.count(),prisma.orderRequest.count({where:{status:'PENDING'}}),prisma.orderRequest.groupBy({by:['status'],_count:{_all:true}}),prisma.orderRequest.findMany({take:8,orderBy:{createdAt:'desc'},include:{user:{select:{fullName:true,profile:{select:{companyName:true}}}},items:{select:{id:true}}}}),prisma.orderRequest.findMany({where:{createdAt:{gte:start}},select:{createdAt:true,status:true}})]);const daily=Array.from({length:30},(_,i)=>{const date=new Date(start);date.setDate(start.getDate()+i);return {date:date.toISOString().slice(0,10),orders:0};});for(const order of periodOrders){const day=order.createdAt.toISOString().slice(0,10),point=daily.find(x=>x.date===day);if(point)point.orders++;}const statusSummary=grouped.map(x=>({status:x.status,count:x._count._all}));sendSuccess(res,{stats:{products,categories,brands,customers,orders,pendingOrders:pending},statusSummary,ordersOverTime:daily,recentOrders:recent.map(o=>({id:o.id,orderNumber:o.orderNumber,status:o.status,createdAt:o.createdAt,items:o.items.length,customerName:o.user.profile?.companyName||o.user.fullName}))});}));

const customerStatusSchema=z.object({isActive:z.boolean()});
router.get('/customers',asyncHandler(async(req,res)=>{const {skip,take,page,limit}=parsePagination(req.query);const search=String(req.query.search||'').trim();const where={role:'CUSTOMER',...(req.query.status==='active'?{isActive:true}:req.query.status==='suspended'?{isActive:false}:{}),...(search?{OR:[{fullName:{contains:search,mode:'insensitive'}},{email:{contains:search,mode:'insensitive'}},{phone:{contains:search,mode:'insensitive'}},{profile:{companyName:{contains:search,mode:'insensitive'}}}]}:{})};const [users,total]=await Promise.all([prisma.user.findMany({where,skip,take,orderBy:{createdAt:'desc'},select:{id:true,fullName:true,email:true,phone:true,isActive:true,createdAt:true,profile:{select:{companyName:true}},_count:{select:{orders:true}}}}),prisma.user.count({where})]);sendSuccess(res,{customers:users.map(({profile,_count,...user})=>({...user,businessName:profile?.companyName||null,orderCount:_count.orders})),meta:buildMeta({page,limit,total})});}));
router.get('/customers/:id',asyncHandler(async(req,res)=>{const customer=await prisma.user.findFirst({where:{id:req.params.id,role:'CUSTOMER'},select:{id:true,fullName:true,email:true,phone:true,isActive:true,isApproved:true,createdAt:true,profile:{select:{companyName:true,businessType:true}},orders:{orderBy:{createdAt:'desc'},select:{id:true,orderNumber:true,status:true,createdAt:true,estimatedTotal:true,items:{select:{id:true,quantity:true,snapshotProductName:true}}}}}});if(!customer)throw notFound('Customer not found');sendSuccess(res,{customer:{...customer,businessName:customer.profile?.companyName||null,profile:undefined}});}));
router.patch('/customers/:id/status',validate(customerStatusSchema),asyncHandler(async(req,res)=>{const existing=await prisma.user.findFirst({where:{id:req.params.id,role:'CUSTOMER'},select:{id:true}});if(!existing)throw notFound('Customer not found');const customer=await prisma.user.update({where:{id:req.params.id},data:{isActive:req.body.isActive},select:{id:true,fullName:true,email:true,isActive:true}});sendSuccess(res,{customer},`Customer ${customer.isActive?'activated':'suspended'}`);}));

export default router;
