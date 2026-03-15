"use client"

import {useState} from "react";

export default function CategoryTabs(){

const [active,setActive]=useState("All");

const categories=[
"All",
"Academics",
"Hostel",
"Gossip",
"Confessions",
"Prof Reviews"
];

return(

<div className="tabs">

{categories.map((c)=>(
<button
key={c}
onClick={()=>setActive(c)}
className={active===c ? "tab active":"tab"}
>
{c}
</button>
))}

</div>

)

}