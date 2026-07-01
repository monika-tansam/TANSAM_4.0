const sharp = require('sharp');

// Function to load an image and extract RGB values
async function loadImageAndExtractRGB(filePath) {
  try {
    const image = sharp(filePath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    console.log(`Image loaded: ${info.width}x${info.height}, Channels: ${info.channels}`);

    // Return both the data and the info as part of the same object
    return { data, info }; // Ensure both data and info are returned here
  } catch (error) {
    console.error('Error loading or processing image:', error);
  }
}


// Function to calculate the color histogram and identify dominant colors

async function analyzeColorDistribution(rgbData, width, height) {
  // Initialize an object to store the color counts
  let histogram = {};

  // Calculate the color histogram
  for (let i = 0; i < rgbData.length; i += 3) { // Skipping every 3 values as they represent R, G, and B
    const rgbKey = `${rgbData[i]}-${rgbData[i + 1]}-${rgbData[i + 2]}`; // Create a unique key for each color

    // Increment the count for the color in the histogram
    histogram[rgbKey] = (histogram[rgbKey] || 0) + 1;
  }

  // Identify dominant colors by filtering out colors with high occurrence
  const dominantColors = Object.keys(histogram).filter((key) => histogram[key] > (width * height * 0.0005)); // Lowered threshold to 0.5%

  // Convert dominant color keys back to RGB values
  const dominantRgbValues = dominantColors.map((key) => {
    return key.split('-').map(Number); // Convert the string back to an array of numbers
  });

  console.log('Dominant Colors:', dominantRgbValues);

  // Further analysis can be done here, such as assessing quality based on color ranges
}

// Function to convert the image to grayscale and analyze texture
async function analyzeTexture(filePath) {
  try {
    // Load the image and convert to grayscale
    const grayscaleImage = sharp(filePath).grayscale();

    // Extract raw pixel data from the grayscale image
    const { data, info } = await grayscaleImage.raw().toBuffer({ resolveWithObject: true });

    // Calculate standard deviation for texture analysis
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
    const stdDeviation = Math.sqrt(variance);

    console.log(`Texture Analysis: Standard Deviation = ${stdDeviation.toFixed(2)}`);

    // Further analysis can be performed here, such as calculating entropy

  } catch (error) {
    console.error('Error during texture analysis:', error);
  }
}

// Function to estimate leaf density in the image  // Promise { pending }
async function estimateLeafDensity(filePath) {
  try {
    // Load the image
    const image = sharp(filePath);

    // Convert the image to grayscale to simplify analysis
    const grayscaleImage = image.grayscale();

    // Extract raw pixel data from the grayscale image
    const { data, info } = await grayscaleImage.raw().toBuffer({ resolveWithObject: true });

    // Thresholding to segment leaves from the background
    // This threshold value may need adjustment based on your images
    const threshold = 128; // A simple fixed threshold for demonstration
    let leafPixels = 0;

    data.forEach((pixel) => {
      if (pixel < threshold) { // Assuming leaves are darker than the background
        leafPixels++;
      }
    });

    // Calculate leaf density as the proportion of leaf pixels to total pixels
    const leafDensity = leafPixels / data.length;

    console.log(`Leaf Density: ${(leafDensity * 100).toFixed(2)}%`);

  } catch (error) {
    console.error('Error during leaf density estimation:', error);

    throw leafDensity;
  }
}

function assessTeaLeafQuality(colorResults, textureMetric, leafDensity) {
  // Initialize quality scores
  let colorQualityScore, textureQualityScore, densityQualityScore;

  // Assess color quality
  if (colorResults.includes('vibrant green')) {
    colorQualityScore = 3; // High quality
  } else if (colorResults.includes('green and brown')) {
    colorQualityScore = 2; // Medium quality
  } else {
    colorQualityScore = 1; // Low quality
  }

  // Assess texture quality
  if (textureMetric < 30) { // Assuming standard deviation as the texture metric; threshold values are placeholders
    textureQualityScore = 3; // High quality
  } else if (textureMetric < 60) {
    textureQualityScore = 2; // Medium quality
  } else {
    textureQualityScore = 1; // Low quality
  }

  // Assess leaf density
  if (leafDensity >= 0.2 && leafDensity <= 0.5) { // Placeholder thresholds
    densityQualityScore = 3; // High quality
  } else if (leafDensity < 0.2 || leafDensity > 0.5 && leafDensity <= 0.7) {
    densityQualityScore = 2; // Medium quality
  } else {
    densityQualityScore = 1; // Low quality
  }

  // Combine the scores for a comprehensive quality assessment
  let overallQualityScore = (colorQualityScore + textureQualityScore + densityQualityScore) / 3;

  // Interpret the overall quality score
  let qualityAssessment = interpretQualityScore(overallQualityScore);

  return qualityAssessment;
}

function interpretQualityScore(score) {
  if (score > 2.5) {
    return 'High Quality';
  } else if (score > 1.5) {
    return 'Medium Quality';
  } else {
    return 'Low Quality';
  }
}

// Example usage
const imagePath = 'A_Grade_Leaf.jpeg'; // Replace this with your image path
loadImageAndExtractRGB(imagePath).then((result) => {
  if (result) {
    const { data, info } = result; // Destructure both data and info from the result
    analyzeColorDistribution(data, info.width, info.height);
  } else {
    console.error('Failed to load image or extract RGB data.');
  }
});
texture_score = analyzeTexture(imagePath);
density_score = estimateLeafDensity(imagePath);

console.log(texture_score);
console.log(density_score);