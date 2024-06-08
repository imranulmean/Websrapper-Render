import Categories from '../models/categories.model.js';

export const  getPredictedCategories = async ()=>{
  const predictedCategories=[];
  if(predictedCategories.length===0){
    const cat= await Categories.find();
    for (let c of cat){
      c=c.toObject();
      predictedCategories.push(c.categoryName);
    }
  }
    return predictedCategories;
  }