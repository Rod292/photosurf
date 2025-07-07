export default function TestPage({ params }: { params: { locale: string } }) {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
      <h1>Test Page Working!</h1>
      <p>Locale: {params.locale}</p>
      <p>This is a simple test to verify the [locale] route structure works.</p>
    </div>
  )
}