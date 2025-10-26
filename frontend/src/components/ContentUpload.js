import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { X, Upload } from 'lucide-react';

const ContentUpload = ({ onClose, onSuccess }) => {
  const { token, API } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cta_buttons: []
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Size limit: 50MB
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result);
    reader.readAsDataURL(selectedFile);
  };

  const toggleCTA = (button) => {
    if (formData.cta_buttons.includes(button)) {
      setFormData({
        ...formData,
        cta_buttons: formData.cta_buttons.filter(b => b !== button)
      });
    } else {
      setFormData({
        ...formData,
        cta_buttons: [...formData.cta_buttons, button]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('cta_buttons', JSON.stringify(formData.cta_buttons));
      uploadData.append('file', file);

      await axios.post(`${API}/content`, uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Content uploaded successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px',
      overflowY: 'auto'
    }} onClick={onClose} data-testid="content-upload-overlay">
      <div className="glass-card" style={{
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()} data-testid="content-upload-modal">
        <button 
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
          onClick={onClose}
          data-testid="close-upload-modal"
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '32px', marginBottom: '24px' }} data-testid="upload-modal-title">Upload Content</h2>

        <form onSubmit={handleSubmit}>
          {/* File Upload */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px' }}>Image or Video</label>
            <div style={{
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                const event = { target: { files: [files[0]] } };
                handleFileChange(event);
              }
            }}>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"
                data-testid="file-input"
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                {preview ? (
                  file?.type.startsWith('video') ? (
                    <video src={preview} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} data-testid="video-preview" />
                  ) : (
                    <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} data-testid="image-preview" />
                  )
                ) : (
                  <>
                    <Upload size={48} style={{ margin: '0 auto 16px', color: 'rgba(255, 255, 255, 0.4)' }} />
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Click or drag file here (max 50MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Title</label>
            <input
              type="text"
              placeholder="Give your content a title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%' }}
              required
              data-testid="title-input"
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Description</label>
            <textarea
              placeholder="Describe your content"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              style={{ width: '100%' }}
              data-testid="description-input"
            />
          </div>

          {/* CTA Buttons */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px' }}>Call-to-Action Buttons</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['subscribe', 'tip', 'send', 'mint'].map((button) => (
                <button
                  key={button}
                  type="button"
                  onClick={() => toggleCTA(button)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: formData.cta_buttons.includes(button) 
                      ? '2px solid #667eea' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    background: formData.cta_buttons.includes(button)
                      ? 'rgba(102, 126, 234, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}
                  data-testid={`cta-${button}-toggle`}
                >
                  {button}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%' }}
            disabled={uploading}
            data-testid="submit-upload-btn"
          >
            {uploading ? 'Uploading...' : 'Upload Content'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContentUpload;
