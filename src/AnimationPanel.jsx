import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { X } from 'lucide-react';

const API_BASE_URL = "https://happy-backend.onrender.com/api";

const MAX_BIG = 8;
const MAX_SMALL = 7;

const AnimationPanel = () => {
  const [images, setImages] = useState([]);

  // State for big images
  const [bigFiles, setBigFiles] = useState([]); // { file: File, preview: URL }
  // State for small images
  const [smallFiles, setSmallFiles] = useState([]);

  const [uploadStatus, setUploadStatus] = useState('');
  const [loadingBig, setLoadingBig] = useState(false);
  const [loadingSmall, setLoadingSmall] = useState(false);

  // Fetch existing images
  const fetchImages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get-image`);
      const data = await res.json();
      if (data.success && data.images) {
        setImages(data.images);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const bigCount = images.filter((img) => img.imageType === 'big').length;
  const smallCount = images.filter((img) => img.imageType === 'small').length;

  // Handle file selection for big images
  const handleBigFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setBigFiles(newPreviews);
  };

  // Handle file selection for small images
  const handleSmallFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSmallFiles(newPreviews);
  };

  // Upload images
  const handleUpload = async (type) => {
    const files = type === 'big' ? bigFiles : smallFiles;
    const currentCount = type === 'big' ? bigCount : smallCount;
    const maxLimit = type === 'big' ? MAX_BIG : MAX_SMALL;

    if (files.length === 0) return;

    if (currentCount >= maxLimit) {
      alert(`Cannot upload more ${type} images. Limit reached.`);
      return;
    }

    if (currentCount + files.length > maxLimit) {
      alert(`You can only upload ${maxLimit - currentCount} more ${type} images.`);
      return;
    }

    const formData = new FormData();
    files.forEach(({ file }) => formData.append('images', file));
    formData.append('imageTypes', Array(files.length).fill(type).join(','));

    if (type === 'big') setLoadingBig(true);
    else setLoadingSmall(true);
    setUploadStatus(`Uploading ${type} images...`);

    try {
      const res = await fetch(`${API_BASE_URL}/images`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const result = await res.json();

      if (result.success) {
        setUploadStatus(`${type} images uploaded successfully!`);
        fetchImages();
        // Clear previews after upload
        if (type === 'big') setBigFiles([]);
        else setSmallFiles([]);
      } else {
        setUploadStatus(`Upload failed: ${result.message}`);
      }
    } catch (err) {
      setUploadStatus('Error uploading images.');
      console.error('Upload error:', err);
    } finally {
      if (type === 'big') setLoadingBig(false);
      else setLoadingSmall(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/images/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setImages((prev) => prev.filter((img) => img._id !== id));
      } else {
        alert('Failed to delete: ' + data.message);
      }
    } catch (err) {
      alert('Error deleting image');
      console.error('Delete error:', err);
    }
  };

  // Helper to render grid for Big and Small
  const renderGrid = (type, count, max, files, handleFilesChange, handleUpload, loading) => {
    const placeholdersCount = max - files.length;
    const placeholders = Array.from({ length: placeholdersCount });

    // State to control visibility of the add photo button
    const [showAddButton, setShowAddButton] = useState(true);

    const handleAddPhotosClick = () => {
      setShowAddButton(false); // Hide the "Add Photos" button once clicked
      document.getElementById(`file-input-${type}`).click(); // Trigger file input click
    };

    return (
      <div className="mb-4 border p-4 rounded">
        <h3 className="text-xl font-semibold mb-2">Upload {type} Images</h3>
        <p>Current {type} Images: {count} / {max}</p>
        
        {/* Hidden file input */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFilesChange(e)}
          disabled={count >= max}
          style={{ display: 'none' }}
          id={`file-input-${type}`}
        />

        {/* Conditionally render Add Photos button */}
        {showAddButton && (
          <label
            htmlFor={`file-input-${type}`}
            className={`cursor-pointer inline-block bg-gray-300 p-2 rounded mb-2 ${count >= max ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleAddPhotosClick}
          >
            + Add Photos
          </label>
        )}

        {/* Upload button */}
        <button
          onClick={() => handleUpload(type)}
          disabled={loading || count >= max}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Uploading...' : `Upload ${type} Images`}
        </button>

        {/* Preview grid */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {files.map((fileObj, index) => (
            <div key={index} className="relative border rounded overflow-hidden">
              <img src={fileObj.preview} alt="" className="w-full h-20 object-cover" />
              <button
                onClick={() => {
                  // Remove selected preview
                  if (type === 'big') {
                    setBigFiles(prev => prev.filter((_, i) => i !== index));
                  } else {
                    setSmallFiles(prev => prev.filter((_, i) => i !== index));
                  }
                }}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {/* Empty placeholders for remaining slots */}
          {placeholders.map((_, i) => (
            <div key={i} className="border rounded flex items-center justify-center h-20 bg-gray-100">
              {/* Empty slot with icon */}
              <span className="text-2xl text-gray-400">+</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>

      {renderGrid('big', bigCount, MAX_BIG, bigFiles, handleBigFilesChange, () => handleUpload('big'), loadingBig)}
      {renderGrid('small', smallCount, MAX_SMALL, smallFiles, handleSmallFilesChange, () => handleUpload('small'), loadingSmall)}

      {uploadStatus && <p className="mt-2 text-sm text-gray-600">{uploadStatus}</p>}

      {/* Existing drag-and-drop image list */}
      <DragDropContext onDragEnd={(result) => {
        if (!result.destination) return;
        const reordered = Array.from(images);
        const [movedItem] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, movedItem);
        setImages(reordered);
      }}>
        <Droppable droppableId="image-list" direction="horizontal">
          {(provided) => (
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {images.map((img, index) => (
                <Draggable key={img._id} draggableId={img._id} index={index}>
                  {(provided) => (
                    <div
                      className="relative border rounded overflow-hidden"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-32 object-cover" />
                      <p className="text-sm text-center py-1">{img.imageType}</p>
                      <button
                        onClick={() => handleDelete(img._id)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default AnimationPanel;
