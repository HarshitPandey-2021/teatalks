import Image from "next/image";

import SearchBar from "../components/SearchBar";
import CategoryTabs from "../components/CategoryTabs";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home(){

return(

<main>

<section className="hero">

<Image
src="/Cup-image.png"
fill
priority
alt="TeaTalks"
/>

<div className="hero-overlay"></div>

<div className="hero-content">

<h1>Your Campus. Your Voice. Zero Judgement</h1>

<p>
TeaTalks is an anonymous student platform where real
campus conversations happen.
</p>

<button className="btn-primary">
Spill the Tea ☕
</button>

</div>

</section>


<div className="page">

<div className="mascot-bg"></div>

<section className="section">

<h2>Search Discussions</h2>

<SearchBar/>

</section>


<section className="section">

<h2>Categories</h2>

<CategoryTabs/>

</section>


<section className="section">

<h2>Why TeaTalks?</h2>

<div className="grid">

<div className="card">
<h3>Anonymous Posts</h3>
<p>Students can speak freely without identity.</p>
</div>

<div className="card">
<h3>Campus Stories</h3>
<p>Real hostel and classroom experiences.</p>
</div>

<div className="card">
<h3>Professor Reviews</h3>
<p>Honest course feedback.</p>
</div>

<div className="card">
<h3>Community Voting</h3>
<p>The best discussions rise to the top.</p>
</div>

</div>

</section>


<section className="section">
<EmptyState/>
</section>

<section className="section">
<LoadingSpinner/>
</section>

</div>

</main>

)

}