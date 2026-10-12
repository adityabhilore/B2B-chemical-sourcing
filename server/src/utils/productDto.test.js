import test from 'node:test';
import assert from 'node:assert/strict';
import { toPublicProductDTO } from './productDto.js';

test('public product DTO omits supplier, source, purchase cost, internal notes, and private relations', () => {
  const result = toPublicProductDTO({
    id: 'p1', name: 'Example chemical', slug: 'example-chemical', status: 'ACTIVE',
    sourceType: 'OTHER_COMPANY', supplierId: 'supplier-private-id', supplier: { name: 'PRIVATE SUPPLIER NAME' },
    supplierCompany: { id: 'supplier-company-id', name: 'PRIVATE SOURCE COMPANY', email: 'private@example.test', notes: 'PRIVATE COMPANY NOTE' },
    purchasePriceRef: '17.25', internalNotes: 'PRIVATE PRODUCT NOTE',
    manufacturerCompany: { id: 'manufacturer1', name: 'Public Manufacturer', email: 'private-manufacturer@example.test', notes: 'PRIVATE MANUFACTURER NOTE' },
    sellerCompany: { id: 'seller1', name: 'Public Seller', email: 'private-seller@example.test', notes: 'PRIVATE SELLER NOTE' },
    variants: [{ id: 'v1', sku: 'SKU-1', isActive: true, price: '25.00', purchaseCost: '8.50', supplierId: 'private-variant-supplier' }],
    documents: [{ id: 'd1', type: 'SDS', isPublic: true, url: 'https://example.test/sds.pdf', fileName: 'sds.pdf' }, { id: 'd2', isPublic: false, url: 'https://example.test/private.pdf' }],
  });
  const json = JSON.stringify(result);
  for (const privateValue of ['sourceType', 'supplierId', 'supplier', 'purchasePriceRef', 'purchaseCost', 'internalNotes', 'supplierCompany', 'PRIVATE SUPPLIER NAME', 'PRIVATE SOURCE COMPANY', 'PRIVATE COMPANY NOTE', 'PRIVATE PRODUCT NOTE', 'private-manufacturer@example.test', 'PRIVATE MANUFACTURER NOTE', 'private-seller@example.test', 'PRIVATE SELLER NOTE', 'private-variant-supplier', 'private.pdf']) {
    assert.equal(json.includes(privateValue), false, `DTO must omit ${privateValue}`);
  }
  assert.equal(result.seller.name, 'Public Seller');
  assert.equal(result.manufacturer.name, 'Public Manufacturer');
  assert.equal(result.variants[0].price, '25.00');
  assert.equal(result.documents.length, 1);
});
