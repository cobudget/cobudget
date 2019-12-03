import Head from "next/head";
import Link from "next/link";
import CreateDream from "./CreateDream";

function Event({ event }) {
  return (
    <div>
      <Head>
        <title>{event.title} | Dreams</title>
      </Head>
      <div>event title: {event.title}</div>
      <div>slug: {event.slug}</div>

      <h2>Dreams</h2>
      <ul>
        {event.dreams.map(dream => (
          <Link href="/[dreamSlug]" as={`/${dream.slug}`} key={dream.slug}>
            <a>
              <li>{dream.title}</li>
            </a>
          </Link>
        ))}
      </ul>
      <h2>Create dream</h2>
      <CreateDream eventId={event.id} />
    </div>
  );
}

export default Event;
