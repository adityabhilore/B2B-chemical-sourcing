// Public catalogue allowlist. Never spread a Prisma product into a public response.
const pick = (object, keys) => object ? Object.fromEntries(keys.filter(key => object[key] !== undefined).map(key => [key, object[key]])) : null;

export function toPublicProductDTO(product) {
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    casNumber: product.casNumber,
    status: product.status,
    pricingMode: product.pricingMode,
    basePrice: product.basePrice,
    taxPercent: product.taxPercent,
    trackStock: product.trackStock,
    stockQuantity: product.trackStock ? product.stockQuantity : null,
    minOrderQuantity: product.minOrderQuantity,
    safetyHandling: product.safetyHandling,
    specifications: product.specifications,
    category: product.category ? {
      ...pick(product.category, ['id', 'name', 'slug', 'parentId']),
      parent: pick(product.category.parent, ['id', 'name', 'slug']),
    } : null,
    brand: pick(product.brand, ['id', 'name', 'slug', 'logoUrl']),
    manufacturer: product.manufacturerCompany
      ? pick(product.manufacturerCompany, ['id', 'name', 'logoUrl', 'website'])
      : pick(product.manufacturer, ['id', 'name', 'country', 'website']),
    seller: pick(product.sellerCompany, ['id', 'name', 'logoUrl', 'website']),
    images: (product.images || []).map(image => pick(image, ['id', 'url', 'altText', 'isPrimary', 'sortOrder'])),
    documents: (product.documents || []).filter(document => document.isPublic).map(document => pick(document, ['id', 'type', 'url', 'fileName', 'fileSize'])),
    variants: (product.variants || []).filter(variant => variant.isActive).map(variant => ({
      ...pick(variant, ['id', 'sku', 'name', 'label', 'packageSize', 'packageUnit', 'weightVolume', 'weightVolumeUnit', 'imageUrl', 'price', 'currency', 'unit', 'moq', 'stockStatus', 'stockQuantity', 'pricingMode']),
    })),
  };
}

export function toPublicProductListDTO(product) {
  const dto = toPublicProductDTO(product);
  if (!dto) return null;
  return pick(dto, ['id', 'name', 'slug', 'casNumber', 'pricingMode', 'basePrice', 'category', 'brand', 'manufacturer', 'images', 'variants']);
}
