
import React, { useEffect, useRef } from "react";
import '../context/Slider.css';
import { assets } from '../assets/assets'; // Assuming assets object has these images

const Slider = () => {
    // useRef is the React way to get a reference to a DOM element
    const slideBoxRef = useRef(null);
    const sliderTrackRef = useRef(null);
    const prevButtonRef = useRef(null);
    const nextButtonRef = useRef(null);
    const dotsContainerRef = useRef(null);

    useEffect(() => {
        // Assign current refs to constants for easier use
        const slideBox = slideBoxRef.current;
        const sliderTrack = sliderTrackRef.current;
        const prevButton = prevButtonRef.current;
        const nextButton = nextButtonRef.current;
        const dotsContainer = dotsContainerRef.current;

        // Ensure all elements are available before running the script
        if (!slideBox || !sliderTrack || !prevButton || !nextButton || !dotsContainer) {
            return;
        }

        const initialSourceImages = Array.from(sliderTrack.querySelectorAll('.slide-initial-source'));
        const imageURLs = initialSourceImages.map(img => img.src);
        const imageAlts = initialSourceImages.map(img => img.alt);
        sliderTrack.innerHTML = ''; // Clear initial static images

        const originalImageCount = imageURLs.length;
        let currentIndex = 0;
        const slideIntervalTime = parseInt(sliderTrack.dataset.interval) || 2000;
        let autoSlideTimer;

        const getVisibleItemsCount = () => {
            if (window.innerWidth <= 480) return 1;
            if (window.innerWidth <= 768) return 2;
            return 3;
        };

        const updateDots = () => {
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                if (index === currentIndex % originalImageCount) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        };

        const updateSliderPosition = (animate = true) => {
            const sliderItemElement = sliderTrack.querySelector('.slide');
            const itemWidth = sliderItemElement ? sliderItemElement.offsetWidth : 0;
            if (itemWidth === 0) return; // Exit if width is not calculated yet

            sliderTrack.style.transition = animate
                ? `transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                : `none`;

            sliderTrack.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

            if (currentIndex >= originalImageCount) {
                setTimeout(() => {
                    sliderTrack.style.transition = 'none';
                    currentIndex = 0;
                    sliderTrack.style.transform = `translateX(0px)`;
                    updateDots();
                    setTimeout(() => {
                        sliderTrack.style.transition = `transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                    }, 50);
                }, 800);
            }
            updateDots();
        };

        const nextSlide = () => {
            currentIndex++;
            updateSliderPosition();
        };

        const prevSlide = () => {
            if (currentIndex === 0) {
                sliderTrack.style.transition = 'none';
                const itemWidth = sliderTrack.querySelector('.slide').offsetWidth;
                currentIndex = originalImageCount; 
                sliderTrack.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
                setTimeout(() => {
                    sliderTrack.style.transition = `transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                    currentIndex--;
                    updateSliderPosition(true);
                }, 50);
            } else {
                currentIndex--;
                updateSliderPosition();
            }
        };

        const handleDotClick = (index) => {
            currentIndex = index;
            updateSliderPosition();
            startAutoSlide(); 
        };

        const generateDots = () => {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < originalImageCount; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                dot.addEventListener('click', () => handleDotClick(i));
                dotsContainer.appendChild(dot);
            }
        };

        const populateSlider = () => {
            sliderTrack.innerHTML = '';
            const visibleItems = getVisibleItemsCount();

            // Original images
            imageURLs.forEach((url, index) => {
                const item = document.createElement('div');
                item.classList.add('slide');
                const img = document.createElement('img');
                img.src = url;
                img.alt = imageAlts[index] || 'Slider Image';
                item.appendChild(img);
                sliderTrack.appendChild(item);
            });

            // Cloned images for infinite loop effect
            for (let i = 0; i < visibleItems; i++) {
                const item = document.createElement('div');
                item.classList.add('slide');
                const img = document.createElement('img');
                img.src = imageURLs[i % originalImageCount];
                img.alt = imageAlts[i % originalImageCount] || 'Cloned Slider Image';
                item.appendChild(img);
                sliderTrack.appendChild(item);
            }

            generateDots();
            updateSliderPosition(false);
        };
        
        const startAutoSlide = () => {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
            autoSlideTimer = setInterval(nextSlide, slideIntervalTime);
        };
        
        const handlePrevClick = () => {
            prevSlide();
            startAutoSlide();
        };
        
        const handleNextClick = () => {
            nextSlide();
            startAutoSlide();
        };

        const handleMouseOver = () => clearInterval(autoSlideTimer);
        const handleMouseOut = () => startAutoSlide();
        
        const handleResize = () => {
            populateSlider();
            startAutoSlide();
        };
        
        // Add Event Listeners
        prevButton.addEventListener('click', handlePrevClick);
        nextButton.addEventListener('click', handleNextClick);
        slideBox.addEventListener('mouseover', handleMouseOver);
        slideBox.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('resize', handleResize);
        
        // Initialize
        populateSlider();
        startAutoSlide();
        
        // Cleanup function: runs when the component unmounts
        return () => {
            clearInterval(autoSlideTimer);
            prevButton.removeEventListener('click', handlePrevClick);
            nextButton.removeEventListener('click', handleNextClick);
            slideBox.removeEventListener('mouseover', handleMouseOver);
            slideBox.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('resize', handleResize);
        };

    }, []); // Empty dependency array ensures this effect runs only once on mount

    return (
        <div className="box1">
            <div className="slide-box" ref={slideBoxRef}>
                <div className="slider" data-interval="2000" ref={sliderTrackRef}>
        
                    <img className="slide-initial-source" src={assets.soccer} alt='Soccer' />
                    <img className="slide-initial-source" src={assets.earth} alt='Basketball' />
                    <img className="slide-initial-source" src={assets.mush} alt='Football' />
                    <img className="slide-initial-source" src={assets.sam} alt='Tennis' />
                    <img className="slide-initial-source" src={assets.air} alt='Volleyball' />
                    <img className="slide-initial-source" src={assets.cat} alt='Cricket' />
                    <img className="slide-initial-source" src={assets.lib} alt='Hockey' />
                </div>

                <button className="prev" aria-label="Previous slide" ref={prevButtonRef}>‹</button>
                <button className="next" aria-label="Next slide" ref={nextButtonRef}>›</button>
                <div className="dots" ref={dotsContainerRef}></div>
            </div>
        </div>
    );
};

export default Slider;