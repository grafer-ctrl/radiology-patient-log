import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Tarif data untuk setiap jenis pemeriksaan
const tarifData: Record<string, { tarif: string[]; jasa: string[] }> = {
  THORAX: {
    tarif: ["122500", "130500", "145500", "153500"],
    jasa: ["40000", "46000", "54000", "58000"],
  },
  LUMBAL: {
    tarif: ["190500", "195500", "202500", "209500"],
    jasa: ["66000", "70000", "74000", "76000"],
  },
  "ABDOMEN 3 PSS": {
    tarif: ["302500", "326500", "366000", "388500"],
    jasa: ["124000", "138000", "160000", "174000"],
  },
  KEPALA: {
    tarif: ["150000", "216000", "259200", "311040"],
    jasa: ["36000", "39000", "41000", "43000"],
  },
  CERVICAL: {
    tarif: ["167000", "190500", "205000", "217500"],
    jasa: ["66000", "80000", "88000", "96000"],
  },
  CLAVICULA: {
    tarif: ["104000", "116500", "124000", "131000"],
    jasa: ["33000", "40000", "44000", "48000"],
  },
  SHOULDER: {
    tarif: ["147500", "154500", "162500", "171500"],
    jasa: ["52000", "55000", "60000", "64000"],
  },
  HUMERUS: {
    tarif: ["147500", "154500", "162500", "171500"],
    jasa: ["52000", "55000", "60000", "64000"],
  },
  ANTEBRACHI: {
    tarif: ["147500", "154500", "162500", "171500"],
    jasa: ["52000", "55000", "60000", "64000"],
  },
  ELBOW: {
    tarif: ["147500", "154500", "162500", "171500"],
    jasa: ["52000", "55000", "60000", "64000"],
  },
  THORACHOLUMBAL: {
    tarif: ["228000", "273600", "328320", "393984"],
    jasa: ["78796", "65664", "54720", "45600"],
  },
  THORACHAL: {
    tarif: ["190500", "195500", "202500", "209500"],
    jasa: ["66000", "70000", "74000", "76000"],
  },
  PEDIS: {
    tarif: ["149500", "154500", "162500", "171500"],
    jasa: ["50000", "55000", "60000", "64000"],
  },
  ANKLE: {
    tarif: ["149500", "154500", "162500", "171500"],
    jasa: ["50000", "55000", "60000", "64000"],
  },
  GENU: {
    tarif: ["149500", "154500", "162500", "171500"],
    jasa: ["50000", "55000", "60000", "64000"],
  },
  CRURIS: {
    tarif: ["172500", "179500", "186500", "193500"],
    jasa: ["66000", "70000", "73000", "76000"],
  },
  FEMUR: {
    tarif: ["172500", "179500", "186500", "193500"],
    jasa: ["66000", "70000", "73000", "76000"],
  },
  WRIST: {
    tarif: ["158500", "165500", "173500", "182500"],
    jasa: ["5000", "6000", "7000", "8000"],
  },
  MANUS: {
    tarif: ["158500", "165500", "173500", "182500"],
    jasa: ["52000", "55000", "60000", "64000"],
  },
  "USG ABDOMEN": {
    tarif: ["400000", "440000", "480000", "520000"],
    jasa: [],
  },
  "USG TIROID": {
    tarif: ["175000", "192000", "210000", "227500"],
    jasa: [],
  },
  "USG MAMAE": {
    tarif: ["190000", "209000", "219000", "228000"],
    jasa: [],
  },
  "USG DOPLER": {
    tarif: ["220000", "242000", "264000", "286000"],
    jasa: [],
  },
  "USG LAIN LAIN": {
    tarif: [],
    jasa: [],
  },
};

const formSchema = z.object({
  no: z.string().optional(),
  kode_penjamin: z.string().min(1, "Kode penjamin wajib diisi"),
  tgl_pemeriksaan: z.date({
    required_error: "Tanggal pemeriksaan wajib diisi",
  }),
  nama_pasien: z.string().min(1, "Nama pasien wajib diisi"),
  jenis_kelamin: z.string().min(1, "Jenis kelamin wajib diisi"),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  jenis_dokter: z.string().min(1, "Jenis dokter wajib diisi"),
  dokter_pengirim: z.string().min(1, "Dokter pengirim wajib diisi"),
  jumlah_film: z.string().optional(),
  pengulangan_foto: z.string().min(1, "Pengulangan foto wajib diisi"),
  penggunaan_faktor_eksposi: z.string().optional(),
  radiografer: z.string().min(1, "Radiografer wajib diisi"),
  jasa_radiografer: z.string().min(1, "Jasa radiografer wajib diisi"),
  jasa_bahaya_radiasi: z.string().min(1, "Jasa bahaya radiasi wajib diisi"),
  jenis_pemeriksaan: z.string().min(1, "Jenis pemeriksaan wajib diisi"),
  tarif_pemeriksaan: z.string().min(1, "Tarif pemeriksaan wajib diisi"),
  jasa_dokter: z.string().min(1, "Jasa dokter wajib diisi"),
});

type FormValues = z.infer<typeof formSchema>;

interface ExaminationFormProps {
  onSuccess: () => void;
  editData?: any;
}

export default function ExaminationForm({ onSuccess, editData }: ExaminationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editData ? {
      no: editData.no || "",
      kode_penjamin: editData.kode_penjamin,
      tgl_pemeriksaan: new Date(editData.tgl_pemeriksaan),
      nama_pasien: editData.nama_pasien,
      jenis_kelamin: editData.jenis_kelamin,
      kelas: editData.kelas,
      jenis_dokter: editData.jenis_dokter,
      dokter_pengirim: editData.dokter_pengirim,
      jumlah_film: editData.jumlah_film || "",
      pengulangan_foto: editData.pengulangan_foto,
      penggunaan_faktor_eksposi: editData.penggunaan_faktor_eksposi || "",
      radiografer: editData.radiografer,
      jasa_radiografer: editData.jasa_radiografer.toString(),
      jasa_bahaya_radiasi: editData.jasa_bahaya_radiasi.toString(),
      jenis_pemeriksaan: editData.jenis_pemeriksaan,
      tarif_pemeriksaan: editData.tarif_pemeriksaan.toString(),
      jasa_dokter: editData.jasa_dokter.toString(),
    } : {
      no: "",
      kode_penjamin: "",
      nama_pasien: "",
      jenis_kelamin: "",
      kelas: "",
      jenis_dokter: "",
      dokter_pengirim: "",
      jumlah_film: "",
      pengulangan_foto: "",
      penggunaan_faktor_eksposi: "",
      radiografer: "",
      jasa_radiografer: "",
      jasa_bahaya_radiasi: "",
      jenis_pemeriksaan: "",
      tarif_pemeriksaan: "",
      jasa_dokter: "",
    },
  });

  const jenisPemeriksaan = form.watch("jenis_pemeriksaan");

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const data = {
        no: values.no || null,
        kode_penjamin: values.kode_penjamin,
        tgl_pemeriksaan: format(values.tgl_pemeriksaan, "yyyy-MM-dd"),
        nama_pasien: values.nama_pasien,
        jenis_kelamin: values.jenis_kelamin,
        kelas: values.kelas,
        jenis_dokter: values.jenis_dokter,
        dokter_pengirim: values.dokter_pengirim,
        jumlah_film: values.jumlah_film || null,
        pengulangan_foto: values.pengulangan_foto,
        penggunaan_faktor_eksposi: values.penggunaan_faktor_eksposi || null,
        radiografer: values.radiografer,
        jasa_radiografer: parseInt(values.jasa_radiografer),
        jasa_bahaya_radiasi: parseInt(values.jasa_bahaya_radiasi),
        jenis_pemeriksaan: values.jenis_pemeriksaan,
        tarif_pemeriksaan: parseInt(values.tarif_pemeriksaan),
        jasa_dokter: parseInt(values.jasa_dokter),
      };

      if (editData) {
        const { error } = await supabase
          .from("radiology_examinations")
          .update(data)
          .eq("id", editData.id);

        if (error) throw error;
        toast.success("Data berhasil diupdate!");
      } else {
        const { error } = await supabase
          .from("radiology_examinations")
          .insert([data]);

        if (error) throw error;
        toast.success("Data berhasil disimpan!");
      }

      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentTarifOptions = jenisPemeriksaan && tarifData[jenisPemeriksaan]
    ? tarifData[jenisPemeriksaan].tarif
    : [];

  const currentJasaOptions = jenisPemeriksaan && tarifData[jenisPemeriksaan]
    ? tarifData[jenisPemeriksaan].jasa
    : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NO</FormLabel>
                <FormControl>
                  <Input placeholder="Nomor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kode_penjamin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Penjamin *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kode penjamin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="ROBPJS">ROBPJS</SelectItem>
                    <SelectItem value="ROUMUM">ROUMUM</SelectItem>
                    <SelectItem value="USGBPJS">USGBPJS</SelectItem>
                    <SelectItem value="USGUMUM">USGUMUM</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tgl_pemeriksaan"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="mb-1">Tanggal Pemeriksaan *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nama_pasien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pasien *</FormLabel>
                <FormControl>
                  <Input placeholder="Nama pasien" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jenis_kelamin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kelas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kelas *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="ASYYIFA">ASYYIFA</SelectItem>
                    <SelectItem value="MULTAZAM">MULTAZAM</SelectItem>
                    <SelectItem value="SALSABILA">SALSABILA</SelectItem>
                    <SelectItem value="FIRDAUS">FIRDAUS</SelectItem>
                    <SelectItem value="POLI UMUM">POLI UMUM</SelectItem>
                    <SelectItem value="LUAR RUMAH SAKIT">LUAR RUMAH SAKIT</SelectItem>
                    <SelectItem value="UGD">UGD</SelectItem>
                    <SelectItem value="POLI DALAM">POLI DALAM</SelectItem>
                    <SelectItem value="POLI ANAK">POLI ANAK</SelectItem>
                    <SelectItem value="RUJUKAN LUAR">RUJUKAN LUAR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jenis_dokter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Dokter *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis dokter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="UMUM">UMUM</SelectItem>
                    <SelectItem value="SPESIALIS">SPESIALIS</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dokter_pengirim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dokter Pengirim *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih dokter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="dr. Rini Nurul Hidayah">dr. Rini Nurul Hidayah</SelectItem>
                    <SelectItem value="dr. Dadang Ismanaf">dr. Dadang Ismanaf</SelectItem>
                    <SelectItem value="dr. Misbakhul Munir">dr. Misbakhul Munir</SelectItem>
                    <SelectItem value="dr. Kurbiyanto">dr. Kurbiyanto</SelectItem>
                    <SelectItem value="dr. Rakhma Nur Aziza">dr. Rakhma Nur Aziza</SelectItem>
                    <SelectItem value="dr. Herry Purwanto">dr. Herry Purwanto</SelectItem>
                    <SelectItem value="dr. Khoirul Anwar, Sp.PD">dr. Khoirul Anwar, Sp.PD</SelectItem>
                    <SelectItem value="dr. Yudha Irla Saputra, Sp.PD, M.M.R">dr. Yudha Irla Saputra, Sp.PD, M.M.R</SelectItem>
                    <SelectItem value="dr. Faiza Risty Aryani Septarini, Sp.A">dr. Faiza Risty Aryani Septarini, Sp.A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jumlah_film"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah Film</FormLabel>
                <FormControl>
                  <Input placeholder="Jumlah film" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pengulangan_foto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pengulangan Foto *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="Ya">Ya</SelectItem>
                    <SelectItem value="Tidak">Tidak</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="penggunaan_faktor_eksposi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Penggunaan Faktor Eksposi</FormLabel>
                <FormControl>
                  <Input placeholder="Faktor eksposi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="radiografer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Radiografer *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih radiografer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="umar">Umar</SelectItem>
                    <SelectItem value="wafiq">Wafiq</SelectItem>
                    <SelectItem value="eko">Eko</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jasa_radiografer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jasa Radiografer *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jasa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="5000">Rp 5.000</SelectItem>
                    <SelectItem value="6000">Rp 6.000</SelectItem>
                    <SelectItem value="7000">Rp 7.000</SelectItem>
                    <SelectItem value="8000">Rp 8.000</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jasa_bahaya_radiasi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jasa Bahaya Radiasi *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jasa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="3500">Rp 3.500</SelectItem>
                    <SelectItem value="4200">Rp 4.200</SelectItem>
                    <SelectItem value="5000">Rp 5.000</SelectItem>
                    <SelectItem value="6000">Rp 6.000</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jenis_pemeriksaan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Pemeriksaan *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis pemeriksaan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card z-50 max-h-[300px]">
                    {Object.keys(tarifData).map((jenis) => (
                      <SelectItem key={jenis} value={jenis}>
                        {jenis}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tarif_pemeriksaan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarif Pemeriksaan *</FormLabel>
                {currentTarifOptions.length > 0 ? (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tarif" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card z-50">
                      {currentTarifOptions.map((tarif) => (
                        <SelectItem key={tarif} value={tarif}>
                          Rp {parseInt(tarif).toLocaleString("id-ID")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Input tarif manual"
                      {...field}
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jasa_dokter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jasa Dokter *</FormLabel>
                {currentJasaOptions.length > 0 ? (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jasa dokter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card z-50">
                      {currentJasaOptions.map((jasa) => (
                        <SelectItem key={jasa} value={jasa}>
                          Rp {parseInt(jasa).toLocaleString("id-ID")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Input jasa dokter manual"
                      {...field}
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            <Save className="mr-2 h-4 w-4" />
            {editData ? "Update Data" : "Simpan Data"}
          </Button>
        </div>
      </form>
    </Form>
  );
}