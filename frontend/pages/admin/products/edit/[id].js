// Edit a product. The Add Product page already supports edit mode by reading
// router.query.id, so this dynamic route reuses it. Visiting
// /admin/products/edit/<id> renders the same form pre-filled with the product.
export { default } from '../add';
