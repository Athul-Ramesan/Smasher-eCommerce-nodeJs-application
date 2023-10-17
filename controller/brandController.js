const brandModel = require('../models/brandModel')

module.exports ={
    postAdminAddBrand: async (req, res) => {
        try {

            const newBrand = new brandModel({
                name: req.body.brand
            })
            await newBrand.save();
            req.flash('bandMessage', "New brand added succesfully")
            res.redirect('/admin/categoriesAndBrands')
        } catch (error) {
            console.log(error);
        }
    },
    getAdminEditBrand: async (req, res) => {
        try {
            const brandId = req.params.id
            
            const brand = await brandModel.findOne({_id:brandId})
            console.log(brand);
            res.render('admin/edit-brand',{brand})

        } catch (error) {
            console.log(error);
        }

    },
    postAdminEditBrand: async (req, res) => {
        try {
            const  brandId = req.params.id;
            console.log(brandId);
            await brandModel.findOneAndUpdate({ _id: brandId }, { name: req.body.name })
            res.redirect('/admin/categoriesAndBrands')
        } catch (error) {
            console.log(error);
        }
    }
}