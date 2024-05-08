import mongoose from 'mongoose';

const categoriesSchema = new mongoose.Schema(
  {
    categoryName: { type: String }    
  }
);

const Categories = mongoose.model('categories', categoriesSchema);

export default Categories;
