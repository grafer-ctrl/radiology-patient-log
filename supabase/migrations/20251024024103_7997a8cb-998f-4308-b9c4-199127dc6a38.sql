-- Create table for radiology examinations
CREATE TABLE public.radiology_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  no text,
  kode_penjamin text NOT NULL,
  tgl_pemeriksaan date NOT NULL,
  nama_pasien text NOT NULL,
  jenis_kelamin text NOT NULL,
  kelas text NOT NULL,
  jenis_dokter text NOT NULL,
  dokter_pengirim text NOT NULL,
  jumlah_film text,
  pengulangan_foto text NOT NULL,
  penggunaan_faktor_eksposi text,
  radiografer text NOT NULL,
  jasa_radiografer integer NOT NULL,
  jasa_bahaya_radiasi integer NOT NULL,
  jenis_pemeriksaan text NOT NULL,
  tarif_pemeriksaan integer NOT NULL,
  jasa_dokter integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.radiology_examinations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public to view all examinations"
  ON public.radiology_examinations
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public to insert examinations"
  ON public.radiology_examinations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update examinations"
  ON public.radiology_examinations
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow public to delete examinations"
  ON public.radiology_examinations
  FOR DELETE
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_radiology_examinations_updated_at
  BEFORE UPDATE ON public.radiology_examinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();