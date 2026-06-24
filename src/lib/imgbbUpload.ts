// ImgBB upload helper - returns hosted image URL
const IMGBB_API_KEY = "2ab2a8ea4a6e2b1b4f3df5591062ff75";

export async function uploadImageToImgbb(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`ImgBB upload failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data?.data?.url) {
    throw new Error("ImgBB لم يرجع رابط الصورة");
  }
  return data.data.url as string;
}

export async function uploadMultipleImagesToImgbb(files: File[]): Promise<string[]> {
  return Promise.all(files.map((f) => uploadImageToImgbb(f)));
}
