import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react"; // Import useRef

const API_BASE_URL = "https://happy-backend.onrender.com/api";

// ... (positions, smallPositions, bigDurations, smallDurations, bigImageInitialPositions, smallImageInitialPositions remain the same)

const Header = () => {
  const [bigImages, setBigImages] = useState([]);
  const [smallImages, setSmallImages] = useState([]);
  const [error, setError] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false); // New state to track if images are loaded

  // Refs to track the number of loaded images
  const bigImagesLoadedCount = useRef(0);
  const smallImagesLoadedCount = useRef(0);
  const totalImagesToLoad = useRef(0);


  const fetchImages = async () => {
    setError(null);
    setImagesLoaded(false); // Reset loaded state when fetching
    bigImagesLoadedCount.current = 0; // Reset counts
    smallImagesLoadedCount.current = 0;
    totalImagesToLoad.current = 0; // Reset total

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
         setImagesLoaded(true); // Consider loaded if none found
         return;
      }

      const big = allImages.filter(img => img.imageType === 'big').map(img => img.imageUrl);
      const small = allImages.filter(img => img.imageType === 'small').map(img => img.imageUrl);

      totalImagesToLoad.current = big.length + small.length; // Set total images to load

      setBigImages(big);
      setSmallImages(small);

      // Note: Animation starts AFTER imagesLoaded becomes true

    } catch (err) {
      console.error("Error fetching images:", err);
      setError(`Failed to fetch images: ${err.message}`);
      setImagesLoaded(true); // Set loaded to true even on error to stop loading indicator if any
    }
  };

  // Effect to fetch images on mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Effect to trigger animation reset after images are loaded and durations are calculated
  useEffect(() => {
    // Only start the animation logic if images are loaded and there are images to animate
    if (imagesLoaded && (bigImages.length > 0 || smallImages.length > 0)) {
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
  }, [animationKey, imagesLoaded, bigImages.length, smallImages.length]); // Added imagesLoaded as a dependency


  // Function to handle image load
  const handleImageLoad = () => {
      // Increment the count for the corresponding image type (optional, but good for debugging)
      // You could distinguish big/small here if needed, but a single total count is simpler

      const loadedCount = bigImagesLoadedCount.current + smallImagesLoadedCount.current + 1; // Increment total
      bigImagesLoadedCount.current++; // Or smallImagesLoadedCount.current++ based on logic if needed
      console.log(`Image loaded. Total loaded: ${loadedCount}/${totalImagesToLoad.current}`); // Debugging


      if (loadedCount >= totalImagesToLoad.current) {
          console.log("All images loaded!");
          setImagesLoaded(true); // Set state to true when all images are loaded
      }
  };

  // Function to handle image error (important for cases where an image fails to load)
  const handleImageError = (e) => {
       console.error("Error loading image:", e.target.src);
       // Even if an image fails, we should still count it towards the total to avoid getting stuck
       const loadedCount = bigImagesLoadedCount.current + smallImagesLoadedCount.current + 1; // Increment total
       bigImagesLoadedCount.current++; // Or smallImagesLoadedCount.current++

       if (loadedCount >= totalImagesToLoad.current) {
           console.log("Completed image loading process (some might have failed).");
           setImagesLoaded(true); // Set state to true even if some failed
       }
  }


  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
  }

  // Optionally show a loading indicator while images are fetching and loading
  if (!imagesLoaded && (bigImages.length > 0 || smallImages.length > 0)) {
      return <div className="flex justify-center items-center h-screen">Loading images...</div>;
  }

   if (bigImages.length === 0 && smallImages.length === 0) {
    // This case is handled after fetching, but before loading check
    // If fetchImages found no images, imagesLoaded will be true already
    return <div className="flex justify-center items-center h-screen">No images found to display.</div>;
  }


  return (
    // The rest of your JSX remains largely the same, BUT we add onLoad and onError
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

      {/* Render images only when imagesLoaded is true */}
      {imagesLoaded && bigImages.map((src, index) => {
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
              // The animation will now only start once imagesLoaded is true
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
              onLoad={handleImageLoad} // Add onLoad handler
              onError={handleImageError} // Add onError handler
            />
          );
      })}

      {/* Render images only when imagesLoaded is true */}
      {imagesLoaded && smallImages.map((src, index) => {
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
              // The animation will now only start once imagesLoaded is true
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
              onLoad={handleImageLoad} // Add onLoad handler
              onError={handleImageError} // Add onError handler
            />
          );
      })}
    </motion.div>
  );
};

export default Header;