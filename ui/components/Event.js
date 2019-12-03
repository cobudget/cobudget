import Head from "next/head";

function Event({ event }) {
  return (
    <div>
      <Head>
        <title>{event.title} | Dreams</title>
      </Head>
      <div>event title: {event.title}</div>
      <div>slug: {event.slug}</div>
    </div>
  );
}

export default Event;
