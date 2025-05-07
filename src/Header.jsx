// App.js

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const API_BASE_URL = "https://happy-backend.onrender.com/api";

const positions = [
  { x: "13vw", y: "15vh", top: 0, left: 0, originX: 0, originY: 0 },
  { x: "-25vw", y: "5vh", top: 0, right: 0, originX: 1, originY: 0 },
  { x: "8vw", y: "5vh", top: 0, left: 0, originX: 0, originY: 0 },
  { x: "-10vw", y: "10vh", top: 0, right: 0, originX: 1, originY: 0 },
  { x: "10vw", y: "-5vh", bottom: 0, left: 0, originX: 0, originY: 1 },
  { x: "-20vw", y: "-20vh", bottom: 0, right: 0, originX: 1, originY: 1 },
  { x: "13vw", y: "-18vh", bottom: 0, left: 0, originX: 0, originY: 1 },
  { x: "-15vw", y: "-10vh", bottom: 0, right: 0, originX: 1, originY: 1 },
];

const smallPositions = [
  { x: "10vw", y: "25vh", top: "10%", left: "45%" },
  { x: "-10vw", y: "-25vh", bottom: "10%", right: "40%" },
  { x: "-15vw", y: "20vh", top: "15%", left: "50%" },
  { x: "-15vw", y: "-20vh", bottom: "20%", right: 0 },
  { x: "-10vw", y: "30vh", top: "5%", right: "30%" },
  { x: "-10vw", y: "5vh", top: 0, right: 0 },
  { x: "10vw", y: "-15vh", bottom:"20%", left: 0 },
];

const bigDurations = [5, 13, 13, 5, 5, 13, 13, 5];
const smallDurations = [5, 5, 5, 13, 13, 15, 13];

const bigImageInitialPositions = [
  { x: -200, y: -200 },
  { x: -200, y: -300 },
  { x: -200, y: -300 },
  { x: 200, y: 200 },
  { x: 0, y: 0 },
  { x: 200, y: 300 },
  { x: 200, y: 300 },
  { x: 0, y: -100 },
];

const smallImageInitialPositions = [
  { x: -250, y: -250 },
  { x: 50, y: 200 },
  { x: -100, y: -300 },
  { x: 500, y: 500 },
  { x: -150, y: -200 },
  { x: 300, y: 0 },
  { x: -300, y: 120 },
];


const Header = () => {
  const [bigImages, setBigImages] = useState([]);
  const [smallImages, setSmallImages] = useState([]);
  const [error, setError] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);

  const fetchImages = async () => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/get-image`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseData = await response.json();

      const allImages = responseData.images;

      if (!allImages || allImages.length === 0) {
         setBigImages([]);
         setSmallImages([]);
         console.log("No images found on the backend.");
         return;
      }

      const big = allImages.filter(img => img.imageType === 'big').map(img => img.imageUrl);
      const small = allImages.filter(img => img.imageType === 'small').map(img => img.imageUrl);

      setBigImages(big);
      setSmallImages(small);

    } catch (err) {
      console.error("Error fetching images:", err);
      setError(`Failed to fetch images: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (!error && (bigImages.length > 0 || smallImages.length > 0)) {
      const currentBigDurations = bigImages.map((_, index) => bigDurations[index % bigDurations.length]);
      const currentSmallDurations = smallImages.map((_, index) => smallDurations[index % smallDurations.length]);

      const allDurations = [...currentBigDurations, ...currentSmallDurations];
      const currentMaxDuration = allDurations.length > 0 ? Math.max(...allDurations) : 0;

      if (currentMaxDuration > 0) {
           const timer = setTimeout(() => {
            setAnimationKey(prevKey => prevKey + 1);
          }, currentMaxDuration * 1000);

          return () => clearTimeout(timer);
      }
    }
  }, [animationKey, error, bigImages.length, smallImages.length]);


  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
  }

  if (bigImages.length === 0 && smallImages.length === 0) {
    return <div className="flex justify-center items-center h-screen">No images found to display.</div>;
  }


  return (
    <motion.div className="relative h-screen w-screen overflow-hidden bg-indigo-200">
      <h1 className="underline absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-black">
        HAPPY SOCIETY
      </h1>
      <motion.p
        className="absolute top-[60%] left-1/2 transform -translate-x-1/2 text-black text-lg md:text-xl font-medium max-w-2xl text-center px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. — 23
      </motion.p>

      {bigImages.map((src, index) => {
          const positionIndex = index % positions.length;
          const initialPositionIndex = index % bigImageInitialPositions.length;
          const durationIndex = index % bigDurations.length;

          const currentPosition = positions[positionIndex];
          const currentInitialPosition = bigImageInitialPositions[initialPositionIndex];
          const currentDuration = bigDurations[durationIndex];

         return (
            <motion.img
              key={`${animationKey}-big-${index}`}
              src={src}
              alt={`Big ${index}`}
              className="object-cover absolute rounded-lg w-80 h-50"
               initial={{
                x: currentInitialPosition?.x || 0,
                y: currentInitialPosition?.y || 0,
                opacity: 1
              }}
              animate={{
                x: currentPosition.x,
                y: currentPosition.y,
                opacity: 0
              }}
              transition={{
                duration: currentDuration,
                ease: "easeInOut",
              }}
              style={{
                willChange: "transform, opacity",
                ...currentPosition,
                originX: currentPosition.originX,
                originY: currentPosition.originY,
              }}
            />
          );
      })}

      {smallImages.map((src, index) => {
          const smallPositionIndex = index % smallPositions.length;
          const smallInitialPositionIndex = index % smallImageInitialPositions.length;
          const smallDurationIndex = index % smallDurations.length;

          const currentSmallPosition = smallPositions[smallPositionIndex];
          const currentSmallInitialPosition = smallImageInitialPositions[smallInitialPositionIndex];
          const currentSmallDuration = smallDurations[smallDurationIndex];

          return (
            <motion.img
              key={`${animationKey}-small-${index}`}
              src={src}
              alt={`Small ${index}`}
              className="object-cover absolute rounded-lg w-20 h-20"
               initial={{
                x: currentSmallInitialPosition?.x || 0,
                y: currentSmallInitialPosition?.y || 0,
                opacity: 1
              }}
              animate={{
                x: currentSmallPosition.x,
                y: currentSmallPosition.y,
                opacity: 0
              }}
              transition={{
                duration: currentSmallDuration,
                ease: "easeInOut",
              }}
              style={{
                 willChange: "transform, opacity",
                ...currentSmallPosition,
              }}
            />
          );
      })}
    </motion.div>
  );
};

export default Header;