import cl from 'classnames';
import { useState, useRef, useEffect } from "react";
import { AiOutlineCaretDown, AiOutlineCaretUp } from 'react-icons/ai';

function Dropdown({ items, buttonLabel, width = 192, height = 192, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(buttonLabel);
    const scrollRef = useRef(null);
    const dropdownRef = useRef(null);

    const handleScroll = (e) => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop += e.deltaY;
        }
    };

    const handleItemClick = (item) => {
        setIsOpen(false);
        setSelectedItem(item.name);
        onChange(item.name);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={dropdownRef}
            style={{ width: `${width}px`, height: `${height}px` }}
            className="relative flex flex-col items-center rounded-lg overflow-hidden"
        >
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={cl(
                    "bg-white shadow-xl p-1 w-full flex items-center justify-between font-bold text-lg",
                    "rounded-lg tracking-wider border-3 border-transparent",
                    "active:border-black duration-300"
                )}
            >
                {selectedItem}
                {!isOpen ? (
                    <AiOutlineCaretDown className="h-8" />
                ) : (
                    <AiOutlineCaretUp className="h-8" />
                )}
            </button>

            {isOpen && (
                <div
                    ref={scrollRef}
                    onWheel={handleScroll}
                    className="absolute bg-white border border-1 border-gray-200 top-11 flex flex-col items-start rounded-lg p-1 w-full max-h-40 overflow-y-auto scroll-smooth no-scrollbar pb-4"
                >
                    {items.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => handleItemClick(item)}
                            className={cl(
                                "flex w-full hover:bg-gray-300 cursor-pointer rounded-r-lg",
                                "border-l-transparent hover:border-l-white border-l-4 p-1"
                            )}
                        >
                            <h3 className="font-bold">{item.name}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dropdown;