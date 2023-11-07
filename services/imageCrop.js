const sharp = require('sharp')

module.exports = {

cropImage : (image)=>{
    return new Promise((resolve,reject)=>{
        try {
            sharp(image)
        .extract({left:0,top:0,width:100,height:100})
        .toFile(image+'new')
        .then(data=>{
            console.log(data);
        })
        .catch(err=>{
            console.log(err);
        })
        resolve(image)
        } catch (error) {
            console.log(error);
        }
        
    })
    
}
// sharp('input.jpg')
//   .resize(300, 200)
//   .toFile('output.jpg', function(err) {
//     // output.jpg is a 300 pixels wide and 200 pixels high image
//     // containing a scaled and cropped version of input.jpg
//   });
}



// const sharp = require('sharp');
// const fs = require('fs');
// const path = require('path');

// // Input file path (the original image)
// const inputFile = 'path/to/your/original/image.jpg';

// // Output folder path (where you want to save the cropped image)
// const outputFolder = 'path/to/your/output/folder';

// // Output file name for the cropped image
// const outputFileName = 'cropped-image.jpg';

// // Coordinates for the cropping (left, top, width, height)
// const left = 100;
// const top = 50;
// const width = 300;
// const height = 200;

// // Create the output folder if it doesn't exist
// if (!fs.existsSync(outputFolder)) {
//   fs.mkdirSync(outputFolder, { recursive: true });
// }

// // Perform the cropping
// sharp(inputFile)
//   .extract({ left, top, width, height })
//   .toFile(path.join(outputFolder, outputFileName), (err, info) => {
//     if (err) {
//       console.error('Error cropping and saving the image:', err);
//     } else {
//       console.log('Image cropped and saved successfully:', info);
//     }
//   });