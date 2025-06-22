// components/RequestCustomDesign.jsx - Professional/Classy Version
import React, { useState } from "react";
import { sendCustomRequest } from "../lib/firebase/customRequests";
import { WhatsAppLink } from "../utils/whatsapp";

const RequestCustomDesign = ({ productId, title, price, category }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    budget: "",
    timeline: "",
    projectType: "modification"
  });
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.message.trim()) newErrors.message = "Please describe your requirements";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatWhatsAppMessage = () => {
    return `🏗️ *CUSTOM DESIGN REQUEST - HILLERSONS INVESTMENT*

📋 *Project Details:*
• Original Design: "${title}"
• Project ID: ${productId}
• Category: ${category}
• Original Price: KES ${price?.toLocaleString() || 'N/A'}

👤 *Client Information:*
• Name: ${formData.name}
• Email: ${formData.email}
• Phone: ${formData.phone}

🎯 *Requirements:*
${formData.message}

💰 *Budget Range:* ${formData.budget || 'To be discussed'}
⏱️ *Timeline:* ${formData.timeline || 'Flexible'}
🔧 *Request Type:* ${formData.projectType === 'modification' ? 'Design Modification' : formData.projectType === 'custom' ? 'Completely Custom Design' : 'Design Consultation'}

${files.length > 0 ? `📎 *Attachments:* ${files.length} file(s) selected (will be sent separately)` : ''}

Looking forward to discussing this project with you! 🤝`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSending(true);

    try {
      // WhatsApp integration
      const whatsappMessage = formatWhatsAppMessage();
      const whatsappUrl = WhatsAppLink(whatsappMessage);
      
      // Optional: Save to Firebase for internal tracking
      const requestData = {
        productId,
        originalTitle: title,
        category,
        originalPrice: price,
        clientInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        requirements: formData.message,
        budget: formData.budget,
        timeline: formData.timeline,
        projectType: formData.projectType,
        attachmentCount: files.length,
        createdAt: new Date(),
        status: 'pending'
      };
      
       await sendCustomRequest(requestData);
      
      // Open WhatsApp
      window.open(whatsappUrl, "_blank");
      
      // Show success state
      setSuccess(true);
      
      // Reset form after delay
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          budget: "",
          timeline: "",
          projectType: "modification"
        });
        setFiles([]);
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      alert("Failed to send request. Please try again.");
      console.error("Custom request error:", err);
    }
    
    setSending(false);
  };

  if (success) {
    return (
      <div style={{ 
        marginTop: "3rem", 
        padding: "3rem", 
        backgroundColor: "#d4edda", 
        borderRadius: "12px",
        border: "1px solid #c3e6cb",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
        <h2 style={{ color: "#155724", marginBottom: "1rem" }}>Request Sent Successfully!</h2>
        <p style={{ color: "#155724", marginBottom: "1.5rem" }}>
          Your custom design request has been sent via WhatsApp. Our team will contact you within 24 hours.
        </p>
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <a 
            href="tel:+254700000000"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#28a745",
              color: "white",
              textDecoration: "none",
              borderRadius: "25px",
              fontWeight: "600"
            }}
          >
            📞 Call Us
          </a>
          <a 
            href="mailto:info@hillersons.com"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "25px",
              fontWeight: "600"
            }}
          >
            ✉️ Email Us
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      marginTop: "3rem", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "16px",
      padding: "0.5rem"
    }}>
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "12px", 
        padding: "2.5rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ 
            fontSize: "2rem", 
            marginBottom: "0.5rem", 
            color: "#2c3e50",
            fontWeight: "700"
          }}>
            🎨 Request Custom Design
          </h2>
          <p style={{ color: "#7f8c8d", fontSize: "1.1rem" }}>
            Transform "<strong>{title}</strong>" to match your vision
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ 
              fontSize: "1.2rem", 
              marginBottom: "1rem", 
              color: "#34495e",
              borderBottom: "2px solid #3498db",
              paddingBottom: "0.5rem"
            }}>
              👤 Contact Information
            </h3>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
              gap: "1rem" 
            }}>
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem", 
                  fontWeight: "600",
                  color: "#2c3e50"
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: errors.name ? "2px solid #e74c3c" : "1px solid #ddd",
                    fontSize: "1rem",
                    transition: "border-color 0.3s ease"
                  }}
                  placeholder="John Doe"
                />
                {errors.name && <span style={{ color: "#e74c3c", fontSize: "0.85rem" }}>{errors.name}</span>}
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem", 
                  fontWeight: "600",
                  color: "#2c3e50"
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: errors.email ? "2px solid #e74c3c" : "1px solid #ddd",
                    fontSize: "1rem"
                  }}
                  placeholder="john@example.com"
                />
                {errors.email && <span style={{ color: "#e74c3c", fontSize: "0.85rem" }}>{errors.email}</span>}
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem", 
                  fontWeight: "600",
                  color: "#2c3e50"
                }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: errors.phone ? "2px solid #e74c3c" : "1px solid #ddd",
                    fontSize: "1rem"
                  }}
                  placeholder="+254 700 000 000"
                />
                {errors.phone && <span style={{ color: "#e74c3c", fontSize: "0.85rem" }}>{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ 
              fontSize: "1.2rem", 
              marginBottom: "1rem", 
              color: "#34495e",
              borderBottom: "2px solid #3498db",
              paddingBottom: "0.5rem"
            }}>
              🏗️ Project Details
            </h3>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "1rem",
              marginBottom: "1rem"
            }}>
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem", 
                  fontWeight: "600",
                  color: "#2c3e50"
                }}>
                  Request Type
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => handleInputChange('projectType', e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "1rem"
                  }}
                >
                  <option value="modification">Design Modification</option>
                  <option value="custom">Completely Custom Design</option>
                  <option value="consultation">Design Consultation</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem", 
                  fontWeight: "600",
                  color: "#2c3e50"
                }}>
                  Budget Range
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "1rem"
                  }}
                >
                  <option value="">Select Budget Range</option>
                  <option value="Under KES 500K">Under KES 500K</option>
                  <option value="KES 500K - 1M">KES 500K - 1M</option>
                  <option value="KES 1M - 3M">KES 1M - 3M</option>
                  <option value="KES 3M - 5M">KES 3M - 5M</option>
                  <option value="Above KES 5M">Above KES 5M</option>
                  <option value="To be discussed">To be discussed</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem", 
                  fontWeight: "600",
                  color: "#2c3e50"
                }}>
                  Timeline
                </label>
                <select
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "1rem"
                  }}
                >
                  <option value="">Select Timeline</option>
                  <option value="ASAP (Rush job)">ASAP (Rush job)</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="3-4 weeks">3-4 weeks</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="3+ months">3+ months</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.5rem", 
                fontWeight: "600",
                color: "#2c3e50"
              }}>
                Detailed Requirements *
              </label>
              <textarea
                placeholder="Please describe in detail what changes you'd like made, specific requirements, style preferences, additional features, etc. The more specific you are, the better we can serve you."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                required
                rows={5}
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: errors.message ? "2px solid #e74c3c" : "1px solid #ddd",
                  fontSize: "1rem",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
              {errors.message && <span style={{ color: "#e74c3c", fontSize: "0.85rem" }}>{errors.message}</span>}
            </div>
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ 
              fontSize: "1.2rem", 
              marginBottom: "1rem", 
              color: "#34495e",
              borderBottom: "2px solid #3498db",
              paddingBottom: "0.5rem"
            }}>
              📎 Reference Files (Optional)
            </h3>
            
            <div style={{
              border: "2px dashed #3498db",
              borderRadius: "8px",
              padding: "2rem",
              textAlign: "center",
              backgroundColor: "#f8f9fa"
            }}>
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label 
                htmlFor="file-upload"
                style={{
                  cursor: "pointer",
                  color: "#3498db",
                  fontWeight: "600"
                }}
              >
                📁 Click to upload reference images, sketches, or documents
              </label>
              <p style={{ color: "#7f8c8d", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                Supported: Images, PDF, DOC files (Max 10MB each)
              </p>
            </div>

            {/* File Preview */}
            {files.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <h4 style={{ marginBottom: "0.5rem", color: "#2c3e50" }}>Selected Files:</h4>
                {files.map((file, index) => (
                  <div key={index} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem",
                    backgroundColor: "#e9ecef",
                    borderRadius: "5px",
                    marginBottom: "0.5rem"
                  }}>
                    <span style={{ fontSize: "0.9rem" }}>📄 {file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e74c3c",
                        cursor: "pointer",
                        fontSize: "1.2rem"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div style={{ textAlign: "center" }}>
            <button
              type="submit"
              disabled={sending || !formData.name || !formData.email || !formData.phone || !formData.message}
              style={{
                padding: "1rem 3rem",
                backgroundColor: sending ? "#95a5a6" : "#27ae60",
                color: "#fff",
                border: "none",
                borderRadius: "30px",
                cursor: sending ? "not-allowed" : "pointer",
                fontWeight: "700",
                fontSize: "1.1rem",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(39, 174, 96, 0.3)"
              }}
            >
              {sending ? "🔄 Sending..." : "🚀 Send Request via WhatsApp"}
            </button>
            
            <p style={{ 
              marginTop: "1rem", 
              fontSize: "0.9rem", 
              color: "#7f8c8d",
              textAlign: "center"
            }}>
              Your request will open WhatsApp with a pre-formatted message. <br/>
              Our team typically responds within 2-4 hours during business hours.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestCustomDesign;