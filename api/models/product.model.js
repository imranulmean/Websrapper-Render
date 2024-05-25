import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  // {
  //   productTitle: String,
  //   productPrice: Number,
  //   productUrl: String,
  //   paginationUrl: String,
  //   productImage:{
  //       type: String,
  //       default:""
  //     },
  //   shop: String,
  //   mainCategoryUrl: String,
  //   mainCategoryName: String,
  //   subCategoryUrl: String,
  //   subCategoryName: String
  // },
  // { timestamps: true }
);

const AldiCollection = mongoose.model('aldiproducts', productSchema);
const ColesCollection = mongoose.model('colesproducts2', productSchema);
const WoolsCollection = mongoose.model('woolsproducts2', productSchema);
const IgaCollection = mongoose.model('igaproducts2', productSchema);

export { AldiCollection, ColesCollection, WoolsCollection, IgaCollection };
