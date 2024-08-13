export default function Home({ data }) {
  return (
    <div>
      <h1>hey, {data}</h1>
    </div>
  );
}

export function getServerSideProps() {
  return {
    props: { data: "it's Somrit" },
  };
}
