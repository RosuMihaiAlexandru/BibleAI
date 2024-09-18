import { Button } from '@/components/ui/Button';
// import { FacebookIcon } from 'lucide-react';
import React from 'react';
import {
    FacebookShareButton, FacebookIcon, InstapaperShareButton, InstapaperIcon,
    WhatsappShareButton, WhatsappIcon, FacebookMessengerShareButton, FacebookMessengerIcon
} from 'react-share';
const ShareComponent = ({ textToShare, linkToShare }) => {
    return (
        <div className="flex flex-col items-center space-y-4">
            <p>{textToShare}</p>
            <div className="flex space-x-4">

                <FacebookShareButton url={`https://genbibleaiapp.kinde.com`} title={textToShare}>
                    <FacebookIcon size={32} round />
                </FacebookShareButton>

                <InstapaperShareButton url={`https://genbibleaiapp.kinde.com`} title={textToShare}>
                    <InstapaperIcon size={32} round />
                </InstapaperShareButton>

                <WhatsappShareButton url={`https://genbibleaiapp.kinde.com`} title={textToShare}>
                    <WhatsappIcon size={32} round />
                </WhatsappShareButton>

                <FacebookMessengerShareButton appId='521270401588372' url={`https://genbibleaiapp.kinde.com `} title={textToShare}>
                    <FacebookMessengerIcon size={32} round />
                </FacebookMessengerShareButton>
            </div>
        </div>
    );
};

export default ShareComponent