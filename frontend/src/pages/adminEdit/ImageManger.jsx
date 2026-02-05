import React, { useEffect, useState } from "react";
import axios from "axios";

const ImageManager = ({ onSelect }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    const res = await axios.get("/api/media/all");
    setImages(res.data.images || []);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    await axios.post("/api/media/upload", formData);
    setUploading(false);
    fetchImages();
  };

  const deleteImage = async (path) => {
    const name = path.split("/").pop();
    await axios.delete(`/api/media/delete/${name}`);
    fetchImages();
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Media Library</h2>
        <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
          {uploading ? "Uploading..." : "Upload Image"}
          <input type="file" hidden onChange={uploadImage} />
        </label>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {images.map((img) => (
          <div
            key={img}
            className="border rounded p-2 relative group cursor-pointer"
          >
            <img
              src={img}
              alt=""
              className="h-28 w-full object-cover rounded"
              onClick={() => onSelect && onSelect(img)}
            />

            <button
              onClick={() => deleteImage(img)}
              className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
            >
              Delete
            </button>

            <p className="text-xs mt-1 break-all">{img}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageManager;