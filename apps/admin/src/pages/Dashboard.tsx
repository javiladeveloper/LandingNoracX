import AdminLayout from '@/components/AdminLayout';

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="border-blood/20 bg-coal max-w-3xl border p-8">
        <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
          Dashboard
        </p>
        <h2 className="font-display text-bone mt-3 text-2xl">Visión general</h2>
        <p className="text-ink mt-4 text-sm leading-relaxed">
          Mientras se construye el resumen de stats, podés ir a <strong>Mensajes</strong> para ver
          los mensajes que llegan del form de contacto del sitio.
        </p>
      </div>
    </AdminLayout>
  );
}
