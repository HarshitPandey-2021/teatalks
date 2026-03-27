import Link from "next/link";

export default function NavBar(){

return(

<nav className="navbar">

<div className="logo">☕ TeaTalks</div>

<div className="navlinks">

<Link href="/">Home</Link>
<Link href="/about">About</Link>
<Link href="/privacy">Privacy</Link>
<Link href="/terms">Terms</Link>


<Link href="/login">
  <button className="btn-outline">Log In</button>
</Link>

<Link href="/signup">
<button className="btn-primary">Sign Up</button>
</Link> 

</div>

</nav>

)

}