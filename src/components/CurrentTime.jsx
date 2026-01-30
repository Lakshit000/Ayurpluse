import React, { useState, useEffect } from 'react';

export default function CurrentTime() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // IST Options
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
    };

    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Kolkata',
        hour12: true
    };

    return (
        <div className="flex flex-col items-end md:items-center">
            <div className="text-[10px] mobile:text-xs font-bold text-gray-400 uppercase tracking-widest">
                {time.toLocaleDateString('en-IN', dateOptions)}
            </div>
            <div className="text-sm mobile:text-lg font-black text-gray-900 leading-tight tabular-nums">
                {time.toLocaleTimeString('en-IN', timeOptions)} <span className="text-[10px] text-gray-400 font-bold">IST</span>
            </div>
        </div>
    );
}
