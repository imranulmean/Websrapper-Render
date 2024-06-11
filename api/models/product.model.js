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

const ColesCollection2 = mongoose.model('coles_softdrinks_chocolate_products2', productSchema);
const WoolsCollection2 = mongoose.model('wools_softdrinks_chocolate_products2', productSchema);
const IgaCollection2 = mongoose.model('iga_softdrinks_chocolate_products2', productSchema);

const AusiCollection = mongoose.model('ausiproducts2', productSchema);

export { AldiCollection, ColesCollection, WoolsCollection, IgaCollection, AusiCollection, ColesCollection2, WoolsCollection2, IgaCollection2 };
