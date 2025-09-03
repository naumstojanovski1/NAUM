import React from "react";
import Heading from "../components/common/Heading";
import Rooms from "../components/home/Rooms";
import CommonHeading from "../components/common/CommonHeading";

export default function Room() {
  return (
    <div>
      <Heading heading="Our Cozy Rooms" title="NaumApartments" subtitle="Explore & Book" />
      <Rooms />
    </div>
  );
}
