
const categoryModel = require('../models/categoryModel')
const { CATEGORY, BRAND } = require('../utils/constants/schemaName')

module.exports = {
    
    getAdminEditCategory: async (req, res) => {
        try {
            const categoryId = req.params.id
            
            const category = await categoryModel.findOne({_id:categoryId})
            
            res.render('admin/edit-category',{category})

        } catch (error) {
            console.log(error);
        }

    },
    postAdminEditCategory: async (req, res) => {
        try {
            const  categoryId = req.params.id;
            await categoryModel.findOneAndUpdate({ _id: categoryId }, { name: req.body.name })
            res.redirect('/admin/categoriesAndBrands')
        } catch (error) {
            console.log(error);
        }
    }
}