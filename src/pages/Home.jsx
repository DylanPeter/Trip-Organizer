  import React, { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { createTrip } from "../utils/tripstore.js";
  
  export default function Home() {
    const navigate = useNavigate();
  
    const handleGetStarted = () => {
      const id = createTrip();           // create new trip in localStorage
      navigate(`/trips/${id}`);          // go straight to its detail page
    };
  
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="text-center">
          <h1 className="text-3xl font-semibold mb-3">Plan trips together, fast.</h1>
          <p className="text-slate-600 mb-6">Create a trip and start checking things off.</p>
          <button
            onClick={handleGetStarted}
            className="rounded-lg bg-slate-900 text-white px-5 py-2 text-sm hover:bg-slate-800"
          >
            Get started
          </button>
        </section>
      </main>
    );
  }  
//   export default function Home() {
//     const [sections, setSections] = useState({
//       hotels: ["Book hotel rooms", "Confirm reservations", "Check-in online"],
//       airTravel: ["Book flights", "Check baggage policy", "Print boarding passes"],
//       groundTransit: ["Arrange airport transfer", "Rent car", "Check public transit options"],
//       attractions: ["Research must-see places", "Buy tickets in advance", "Plan daily itinerary"],
//       foodDining: ["Find popular restaurants", "Make reservations", "Check dietary options"],
//       packList: ["Clothes", "Travel documents", "Electronics & chargers"]
//     });
  
//     const addItem = (sectionKey, item) => {
//       if (!item.trim()) return;
//       setSections((prev) => ({
//         ...prev,
//         [sectionKey]: [...prev[sectionKey], item],
//       }));
//     };
  
//     return (
//       <main className="mx-auto max-w-3xl p-6">
//         <h1 className="text-2xl font-bold mb-4">Travel Planning Checklist</h1>
  
//         {Object.entries(sections).map(([key, items]) => (
//           <div key={key} className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
//             <h2 className="text-lg font-semibold capitalize mb-2">
//               {key.replace(/([A-Z])/g, " $1")}
//             </h2>
  
//             <ul className="space-y-1 mb-3">
//               {items.map((item, i) => (
//                 <li key={i} className="flex items-center gap-2">
//                   <input type="checkbox" />
//                   <span>{item}</span>
//                 </li>
//               ))}
//             </ul>
  
//             <AddItemForm
//               onAdd={(newItem) => addItem(key, newItem)}
//               placeholder={`Add new ${key.replace(/([A-Z])/g, " $1").toLowerCase()} item`}
//             />
//           </div>
//         ))}
//       </main>
//     );
//   }
  
//   function AddItemForm({ onAdd, placeholder }) {
//     const [value, setValue] = useState("");
  
//     const handleSubmit = (e) => {
//       e.preventDefault();
//       onAdd(value);
//       setValue("");
//     };
  
//     return (
//       <form onSubmit={handleSubmit} className="flex gap-2">
//         <input
//           value={value}
//           onChange={(e) => setValue(e.target.value)}
//           placeholder={placeholder}
//           className="flex-1 rounded border px-3 py-2 text-sm"
//         />
//         <button
//           type="submit"
//           className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
//         >
//           Add
//         </button>
//       </form>
//     );
//   }