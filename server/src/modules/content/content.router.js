import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireAdmin } from '../../middleware/authorise.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { badRequest, notFound } from '../../utils/AppError.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { parsePagination, buildMeta } from '../../utils/pagination.js';
import { slugify } from '../../utils/slugify.js';
import { sanitizeHtml } from '../../utils/sanitizeHtml.js';
import { sendMail } from '../../lib/mailer.js';
import { config } from '../../config/index.js';
import { imageUpload } from '../../lib/multer.js';
import { uploadBuffer } from '../../lib/cloudinary.js';

const router = Router();
const publicSettingKeys = ['site.name','site.description','site.email','site.phone','site.address','site.businessHours','site.whatsapp','site.mapUrl','theme.logoUrl','theme.primaryColor','theme.secondaryColor','theme.font'];
const defaults = { site:{name:'Chemical Market',description:'B2B chemical catalogue and enquiry platform'}, theme:{primaryColor:'#1d4ed8',secondaryColor:'#0f766e',font:'Inter'} };
const emailText = (value) => String(value || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const settingValues = async (keys=null) => {
  const rows = await prisma.siteSetting.findMany({where:keys?{key:{in:keys}}:{}});
  return Object.fromEntries(rows.map(row => [row.key,row.value]));
};
const contactInput = z.object({name:z.string().trim().min(2).max(120),company:z.string().trim().max(160).optional().nullable(),email:z.string().email().max(254),phone:z.string().trim().max(40).optional().nullable(),subject:z.string().trim().max(160).optional().nullable(),message:z.string().trim().min(10).max(5000),website:z.string().max(0).optional().default('')});
const blogInput = z.object({title:z.string().trim().min(1).max(200),slug:z.string().trim().optional().or(z.literal('')),excerpt:z.string().max(500).optional().nullable(),category:z.string().max(80).optional().nullable(),content:z.string().min(1).max(100000),coverImageUrl:z.string().url().optional().or(z.literal('')).nullable(),cloudinaryId:z.string().optional().nullable(),status:z.enum(['PUBLISHED','DRAFT','ARCHIVED']),authorName:z.string().max(120).optional().nullable(),tags:z.array(z.string().max(50)).max(20).default([]),metaTitle:z.string().max(200).optional().nullable(),metaDesc:z.string().max(320).optional().nullable()});
const sectionInput = z.object({type:z.enum(['HERO_BANNER','FEATURED_CATEGORIES','FEATURED_PRODUCTS','ANNOUNCEMENT','TESTIMONIALS','CUSTOM_HTML']),title:z.string().max(200).optional().nullable(),subtitle:z.string().max(500).optional().nullable(),content:z.record(z.any()).default({}),isActive:z.boolean(),sortOrder:z.number().int().min(0)});
const settingInput = z.object({settings:z.record(z.any())});

router.get('/public/homepage',asyncHandler(async(_req,res)=>{
  const [sections,settings]=await Promise.all([prisma.homepageSection.findMany({where:{isActive:true},orderBy:{sortOrder:'asc'}}),settingValues(publicSettingKeys)]);
  const site={...defaults.site},theme={...defaults.theme};
  for(const [key,value] of Object.entries(settings)){const [group,name]=key.split('.');if(group==='site')site[name]=value;if(group==='theme')theme[name]=value;}
  if(!/^#[\da-f]{6}$/i.test(String(theme.primaryColor)))theme.primaryColor=defaults.theme.primaryColor;
  if(!/^#[\da-f]{6}$/i.test(String(theme.secondaryColor)))theme.secondaryColor=defaults.theme.secondaryColor;
  if(!['Inter','Roboto','Lato','Arial'].includes(theme.font))theme.font=defaults.theme.font;
  sendSuccess(res,{sections:sections.map(({id,type,title,subtitle,content,sortOrder})=>({id,type,title,subtitle,content,sortOrder})),site,theme});
}));

router.get('/public/blog',asyncHandler(async(req,res)=>{const {skip,take,page,limit}=parsePagination(req.query);const search=String(req.query.search||'').trim();const where={status:'PUBLISHED',...(search?{OR:[{title:{contains:search,mode:'insensitive'}},{excerpt:{contains:search,mode:'insensitive'}}]}:{})};const [items,total]=await Promise.all([prisma.blogPost.findMany({where,skip,take,orderBy:{publishedAt:'desc'},select:{id:true,title:true,slug:true,excerpt:true,category:true,coverImageUrl:true,status:true,publishedAt:true,authorName:true,tags:true,metaTitle:true,metaDesc:true}}),prisma.blogPost.count({where})]);sendSuccess(res,{items,meta:buildMeta({page,limit,total})});}));
router.get('/public/blog/:slug',asyncHandler(async(req,res)=>{const post=await prisma.blogPost.findFirst({where:{slug:req.params.slug,status:'PUBLISHED'}});if(!post)throw notFound('Article not found');sendSuccess(res,{...post,content:sanitizeHtml(post.content)});}));

router.post('/public/contact',rateLimit({windowMs:15*60*1000,max:5,standardHeaders:true,legacyHeaders:false,message:{success:false,message:'Too many enquiries. Please try again later.'}}),validate(contactInput),asyncHandler(async(req,res)=>{
  if(req.body.website) return sendSuccess(res,{accepted:true},'Enquiry received');
  const {name,company,email,phone,subject,message}=req.body;
  const enquiry=await prisma.contactEnquiry.create({data:{name,company:company||null,email,phone:phone||null,subject:subject||null,message}});
  const settings=await settingValues(['site.notificationEmail']);const recipient=settings['site.notificationEmail']||config.email.user;
  await sendMail({to:recipient,subject:`New website enquiry${subject?`: ${subject}`:''}`,text:`Name: ${name}\nCompany: ${company||'—'}\nEmail: ${email}\nPhone: ${phone||'—'}\n\n${message}`,html:`<h2>New website enquiry</h2><p><b>Name:</b> ${emailText(name)}</p><p><b>Company:</b> ${emailText(company||'—')}</p><p><b>Email:</b> ${emailText(email)}</p><p><b>Phone:</b> ${emailText(phone||'—')}</p><p>${emailText(message).replace(/\n/g,'<br>')}</p>`});
  sendSuccess(res,{id:enquiry.id},'Your enquiry has been received',201);
}));

router.use('/admin',authenticate,requireAdmin);
router.post('/admin/upload',imageUpload.single('file'),asyncHandler(async(req,res)=>{const file=req.file;if(!file)throw badRequest('Select an image to upload');const b=file.buffer;const valid=file.mimetype==='image/jpeg'&&b[0]===0xff&&b[1]===0xd8&&b[2]===0xff||file.mimetype==='image/png'&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||file.mimetype==='image/webp'&&b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP';if(!valid)throw badRequest('Image content must be a valid JPEG, PNG, or WebP file');const asset=await uploadBuffer(b,{folder:'chemical-market/content',resource_type:'image'});sendSuccess(res,{url:asset.url,cloudinaryId:asset.publicId},'Image uploaded');}));
router.get('/admin/homepage',asyncHandler(async(_req,res)=>{const [sections,settings]=await Promise.all([prisma.homepageSection.findMany({orderBy:{sortOrder:'asc'}}),settingValues()]);sendSuccess(res,{sections,settings});}));
router.post('/admin/homepage/sections',validate(sectionInput),asyncHandler(async(req,res)=>sendSuccess(res,await prisma.homepageSection.create({data:req.body}),'Homepage section added',201)));
router.patch('/admin/homepage/sections/:id',validate(sectionInput),asyncHandler(async(req,res)=>{if(!await prisma.homepageSection.findUnique({where:{id:req.params.id}}))throw notFound('Homepage section not found');sendSuccess(res,await prisma.homepageSection.update({where:{id:req.params.id},data:req.body}),'Homepage section saved');}));
router.delete('/admin/homepage/sections/:id',asyncHandler(async(req,res)=>{await prisma.homepageSection.delete({where:{id:req.params.id}});sendSuccess(res,null,'Homepage section removed');}));
router.put('/admin/settings',validate(settingInput),asyncHandler(async(req,res)=>{const allowed=new Set(['site.name','site.description','site.email','site.phone','site.address','site.businessHours','site.whatsapp','site.mapUrl','site.notificationEmail','theme.logoUrl','theme.primaryColor','theme.secondaryColor','theme.font']);const entries=Object.entries(req.body.settings);for(const [key,value] of entries){if(!allowed.has(key))throw badRequest(`Setting '${key}' cannot be updated`);if(key.endsWith('Color')&&!/^#[\da-f]{6}$/i.test(String(value)))throw badRequest(`${key} must be a six-digit hex colour`);if(key==='theme.font'&&!['Inter','Roboto','Lato','Arial'].includes(value))throw badRequest('Unsupported font choice');await prisma.siteSetting.upsert({where:{key},create:{key,value},update:{value}});}sendSuccess(res,await settingValues(),'Site settings saved');}));
router.get('/admin/blog',asyncHandler(async(req,res)=>{const {skip,take,page,limit}=parsePagination(req.query);const search=String(req.query.search||'').trim();const where=search?{OR:[{title:{contains:search,mode:'insensitive'}},{slug:{contains:search,mode:'insensitive'}}]}:{};const [items,total]=await Promise.all([prisma.blogPost.findMany({where,skip,take,orderBy:{updatedAt:'desc'}}),prisma.blogPost.count({where})]);sendSuccess(res,{items,meta:buildMeta({page,limit,total})});}));
router.post('/admin/blog',validate(blogInput),asyncHandler(async(req,res)=>{const data={...req.body,slug:slugify(req.body.slug||req.body.title),content:sanitizeHtml(req.body.content),publishedAt:req.body.status==='PUBLISHED'?new Date():null};sendSuccess(res,await prisma.blogPost.create({data}),'Article saved',201);}));
router.patch('/admin/blog/:id',validate(blogInput),asyncHandler(async(req,res)=>{const old=await prisma.blogPost.findUnique({where:{id:req.params.id}});if(!old)throw notFound('Article not found');const data={...req.body,slug:slugify(req.body.slug||req.body.title),content:sanitizeHtml(req.body.content),publishedAt:req.body.status==='PUBLISHED'?(old.publishedAt||new Date()):null};sendSuccess(res,await prisma.blogPost.update({where:{id:old.id},data}),'Article saved');}));
router.delete('/admin/blog/:id',asyncHandler(async(req,res)=>{await prisma.blogPost.delete({where:{id:req.params.id}});sendSuccess(res,null,'Article deleted');}));
router.get('/admin/enquiries',asyncHandler(async(req,res)=>{const {skip,take,page,limit}=parsePagination(req.query);const status=String(req.query.status||'');const search=String(req.query.search||'').trim();const where={...(status?{status}:{}),...(search?{OR:[{name:{contains:search,mode:'insensitive'}},{email:{contains:search,mode:'insensitive'}},{company:{contains:search,mode:'insensitive'}}]}:{})};const [items,total]=await Promise.all([prisma.contactEnquiry.findMany({where,skip,take,orderBy:{createdAt:'desc'}}),prisma.contactEnquiry.count({where})]);sendSuccess(res,{items,meta:buildMeta({page,limit,total})});}));
router.patch('/admin/enquiries/:id',asyncHandler(async(req,res)=>{const status=String(req.body.status||'');if(!['NEW','READ','CLOSED'].includes(status))throw badRequest('Invalid enquiry status');sendSuccess(res,await prisma.contactEnquiry.update({where:{id:req.params.id},data:{status}}),'Enquiry status updated');}));

export default router;
