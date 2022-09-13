import googleMap from "../googleMap";

export default test("Get Distance By Google", async () => {
  const result = await googleMap.getDistance(
    [{ lat: 10.76247228322259, lng: 106.70831179043745 }],
    [{ lat: 10.7656114798132, lng: 106.692408021591 }]
  );
  console.log("result", JSON.stringify(result.data.rows, null, 2));
});
