import React from "react";
import Hero from "./Hero";
import Book from "./Book";
import About from "./About";
import Services from "./Service";
import Rooms from "./Rooms";

export default function Home() {
  return (
    <div>
      <Hero />
      <Book />
      <About />
      <Rooms limit={3} />
      <Services />
    </div>
  );
}
