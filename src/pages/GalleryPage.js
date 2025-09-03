import React from "react";
import Heading from "../components/common/Heading";
import StaticGallery from "../components/home/StaticGallery";

export default function GalleryPage() {
  return (
    <div>
      <Heading heading="Gallery" title="NaumApartments" subtitle="Gallery" />
      <StaticGallery />
    </div>
  );
}


