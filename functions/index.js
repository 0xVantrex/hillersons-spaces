const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");

const cloudinary = require("cloudinary").v2;

// Set Cloudinary config
cloudinary.config({
  cloud_name: "dbj7nhyy4",
  api_key: "your_actual_api_key", // ⛔️ REPLACE this
  api_secret: "your_actual_api_secret", // ⛔️ REPLACE this
  secure: true,
});

// Set global options for all functions
setGlobalOptions({maxInstances: 10});

/**
 * Validate Cloudinary upload
 * This function checks that an uploaded image is either JPEG or PNG
 * and under 5MB.
 */
exports.validateUpload = onRequest(async (req, res) => {
  try {
    const {public_id: publicId} = req.body;

    if (!publicId) {
      return res.status(400).json({error: "Missing publicId in request"});
    }

    const resource = await cloudinary.api.resource(publicId);

    const mimeType = `${resource.resource_type}/${resource.format}`;
    const sizeLimit = 5 * 1024 * 1024; // 5MB

    if (
      !["image/jpeg", "image/png"].includes(mimeType) ||
      resource.bytes > sizeLimit
    ) {
      return res
          .status(403)
          .json({error: "Image does not meet validation criteria."});
    }

    return res.status(200).json({message: "Image validated successfully."});
  } catch (err) {
    console.error("Cloudinary validation error:", err.message);
    return res.status(500).json({error: "Server error validating image"});
  }
});
