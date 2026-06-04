function Floor() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[28, 26]} />
        <meshStandardMaterial color="#0b1727" roughness={0.72} metalness={0.08} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 3.9]}>
        <planeGeometry args={[25, 2.2]} />
        <meshStandardMaterial color="#12243a" roughness={0.85} />
      </mesh>

      {[-7.5, -2.5, 2.5, 7.5].map(x => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.025, 3.9]}>
          <planeGeometry args={[0.1, 2.1]} />
          <meshStandardMaterial color="#f8c471" emissive="#3b2603" emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

export default Floor;
