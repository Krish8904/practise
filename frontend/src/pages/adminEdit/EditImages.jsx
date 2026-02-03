import React, { useEffect, useState } from "react";
import axios from "axios";

const EditImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/images`)
      .then(res => setImages(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e, index) => {
    setSelectedFile(e.target.files[0]);
    setSelectedIndex(index);
  };

  const uploadImage = async () => {
    if (!selectedFile || selectedIndex === null) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("page", images[selectedIndex].page);
      formData.append("section", images[selectedIndex].section);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/images/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const updatedImages = [...images];
      updatedImages[selectedIndex].img = res.data.path;
      setImages(updatedImages);
      setSelectedFile(null);
      setSelectedIndex(null);
      alert("Image updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    }

    setSaving(false);
  };

  if (loading) return <p className="text-center mt-20">Loading images...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Images</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {images.map((img, i) => (
          <div key={i} className="border rounded-lg p-4 flex flex-col items-center">
            <img src={img.img} alt={img.section} className="h-40 object-cover rounded mb-2" />
            <p className="mb-2 font-semibold">{img.page} - {img.section}</p>
            <input type="file" onChange={(e) => handleFileChange(e, i)} />
            <div className="flex gap-2 mt-2">
              <button
                onClick={uploadImage}
                disabled={saving || selectedIndex !== i}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Upload
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditImages;
