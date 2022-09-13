import React from "react";
import { useState, useEffect } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
interface Propstype extends ReactProps {
  voted: number;
  onChange: Function;
}

export function RatingOrder(props: Propstype) {
  const [fiveStar, setFiveStar] = useState([
    { id: 0, checked: false },
    { id: 1, checked: false },
    { id: 2, checked: false },
    { id: 3, checked: false },
    { id: 4, checked: false },
  ]);
  useEffect(() => {
    fiveStar.forEach((item) => {
      item.id < props.voted ? (item.checked = true) : (item.checked = false);
    });
    setFiveStar([...fiveStar]);
  }, [props.voted]);
  return (
    <div className={`flex justify-evenly main-container ${props.className || ""} `}>
      {fiveStar.map((item) => (
        <i
          className={`text-[24px] sm:text-4xl cursor-pointer duration-300 transition-all ${item.checked ? "text-yellow-400" : "text-gray-300"
            }`}
          onClick={() => props.onChange(item.id + 1)}
          key={item.id}
        >
          {item.checked ? <FaStar /> : <FaRegStar />}
        </i>
      ))}
    </div>
  );
}
