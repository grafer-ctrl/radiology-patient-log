import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Edit2, Trash2, Download, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExaminationTableProps {
  refresh: number;
  onEdit: (data: any) => void;
}

export default function ExaminationTable({ refresh, onEdit }: ExaminationTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM")
  );

  useEffect(() => {
    fetchData();
  }, [refresh, selectedMonth]);

  async function fetchData() {
    try {
      setLoading(true);
      const startDate = `${selectedMonth}-01`;
      const endDate = format(
        new Date(parseInt(selectedMonth.split("-")[0]), parseInt(selectedMonth.split("-")[1]), 0),
        "yyyy-MM-dd"
      );

      const { data: examinations, error } = await supabase
        .from("radiology_examinations")
        .select("*")
        .gte("tgl_pemeriksaan", startDate)
        .lte("tgl_pemeriksaan", endDate)
        .order("tgl_pemeriksaan", { ascending: false });

      if (error) throw error;
      setData(examinations || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("radiology_examinations")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      toast.success("Data berhasil dihapus");
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Gagal menghapus data");
    } finally {
      setDeleteId(null);
    }
  }

  function exportToExcel() {
    if (data.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    const exportData = data.map((item) => ({
      NO: item.no || "-",
      "Kode Penjamin": item.kode_penjamin,
      "Tanggal Pemeriksaan": format(new Date(item.tgl_pemeriksaan), "dd MMMM yyyy", {
        locale: localeId,
      }),
      "Nama Pasien": item.nama_pasien,
      "Jenis Kelamin": item.jenis_kelamin,
      Kelas: item.kelas,
      "Jenis Dokter": item.jenis_dokter,
      "Dokter Pengirim": item.dokter_pengirim,
      "Jumlah Film": item.jumlah_film || "-",
      "Pengulangan Foto": item.pengulangan_foto,
      "Penggunaan Faktor Eksposi": item.penggunaan_faktor_eksposi || "-",
      Radiografer: item.radiografer,
      "Jasa Radiografer": item.jasa_radiografer,
      "Jasa Bahaya Radiasi": item.jasa_bahaya_radiasi,
      "Jenis Pemeriksaan": item.jenis_pemeriksaan,
      "Tarif Pemeriksaan": item.tarif_pemeriksaan,
      "Jasa Dokter": item.jasa_dokter,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Pemeriksaan");

    const monthName = format(new Date(selectedMonth), "MMMM yyyy", {
      locale: localeId,
    });
    XLSX.writeFile(wb, `Data_Pemeriksaan_${monthName}.xlsx`);
    toast.success(`Data ${monthName} berhasil diunduh`);
  }

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, "yyyy-MM");
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {format(new Date(month), "MMMM yyyy", { locale: localeId })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={exportToExcel}
          variant="outline"
          className="gap-2"
          disabled={data.length === 0}
        >
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Tidak ada data untuk bulan ini
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-accent/50">
                <TableHead className="whitespace-nowrap">NO</TableHead>
                <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                <TableHead className="whitespace-nowrap">Nama Pasien</TableHead>
                <TableHead className="whitespace-nowrap">Jenis Kelamin</TableHead>
                <TableHead className="whitespace-nowrap">Kode Penjamin</TableHead>
                <TableHead className="whitespace-nowrap">Jenis Pemeriksaan</TableHead>
                <TableHead className="whitespace-nowrap text-right">Tarif</TableHead>
                <TableHead className="whitespace-nowrap text-right">Jasa Dokter</TableHead>
                <TableHead className="whitespace-nowrap text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id} className="hover:bg-accent/20">
                  <TableCell>{item.no || "-"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(item.tgl_pemeriksaan), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">{item.nama_pasien}</TableCell>
                  <TableCell>{item.jenis_kelamin}</TableCell>
                  <TableCell>{item.kode_penjamin}</TableCell>
                  <TableCell>{item.jenis_pemeriksaan}</TableCell>
                  <TableCell className="text-right">
                    Rp {item.tarif_pemeriksaan.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right">
                    Rp {item.jasa_dokter.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(item.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pemeriksaan ini? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}