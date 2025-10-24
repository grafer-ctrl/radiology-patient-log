import { useState } from "react";
import { Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExaminationForm from "@/components/ExaminationForm";
import ExaminationTable from "@/components/ExaminationTable";

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditData(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEdit = (data: any) => {
    setEditData(data);
    setIsFormOpen(true);
  };

  const handleNewForm = () => {
    setEditData(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-primary to-secondary rounded-2xl mb-4 shadow-lg">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Sistem Manajemen Radiologi
          </h1>
          <p className="text-muted-foreground text-lg">
            Kelola data pemeriksaan radiologi dengan mudah dan efisien
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm mb-6">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Data Pemeriksaan Pasien</CardTitle>
                <CardDescription className="text-base">
                  Daftar lengkap pemeriksaan radiologi
                </CardDescription>
              </div>
              <Button
                onClick={handleNewForm}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Data Baru
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ExaminationTable refresh={refreshKey} onEdit={handleEdit} />
          </CardContent>
        </Card>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editData ? "Edit Data Pemeriksaan" : "Tambah Data Pemeriksaan Baru"}
              </DialogTitle>
              <DialogDescription>
                {editData
                  ? "Perbarui informasi pemeriksaan pasien"
                  : "Isi formulir dengan lengkap untuk menambahkan data pemeriksaan baru"}
              </DialogDescription>
            </DialogHeader>
            <ExaminationForm onSuccess={handleFormSuccess} editData={editData} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;