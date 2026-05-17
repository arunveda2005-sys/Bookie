// Format seconds into MM:SS format
export const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export const parseTimeToSeconds = (timeString) => {
    if (!timeString) return 0;
    const [minutes, seconds] = timeString.split(':').map(Number);
    return (minutes * 60) + (seconds || 0);
};
