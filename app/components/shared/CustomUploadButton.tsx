import { useRef, useState } from 'react';
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DNA } from 'react-loader-spinner';

const CLOUDINARY_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_UPLOAD_PRESET; // Set up in Cloudinary settings

const CustomUploadButton = ({ setUploadedFileName }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const fileUploadRef = useRef<any>();

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const response = await fetch(CLOUDINARY_UPLOAD_URL, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setUploadedFileName(data.secure_url); // Save Cloudinary image URL
            setIsUploading(false);
        } catch (error) {
            // setUploadError('Failed to upload image');
            setIsUploading(false);
        }
    };

    return (
        <form className="flex flex-col gap-4">
            <input
                ref={fileUploadRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="file-upload-input"
            />
            <label htmlFor="file-upload-input">
                <Button
                    onClick={(e) => { e.preventDefault(); fileUploadRef.current.click() }}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <DNA
                            visible={true}
                            height="20"
                            width="20"
                            ariaLabel="dna-loading"
                            wrapperStyle={{}}
                            wrapperClass="dna-wrapper"
                        />
                    ) : (
                        <ImageIcon />
                    )}
                </Button>
            </label>
            {uploadError && <p>{uploadError}</p>}
        </form>
    );
};

export default CustomUploadButton;
