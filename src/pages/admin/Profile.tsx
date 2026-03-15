import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Shield, Camera, Pencil, Check, X, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminProfile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password reset state
  const [savingProfile, setSavingProfile] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl ?? null);
    }
  }, [user?.uid, user?.name, user?.email, user?.avatarUrl]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
      };
      reader.readAsDataURL(file);
      toast.success("Avatar actualizado correctamente");
    }
  };

  const handleSave = async () => {
    setSavingProfile(true);
    const result = await updateProfile({ name: name.trim(), email: email.trim(), avatarUrl: avatarUrl ?? "" });
    setSavingProfile(false);
    if (result.ok) {
      setIsEditing(false);
      toast.success("Perfil actualizado correctamente");
    } else {
      toast.error("error" in result ? result.error : "No se pudo actualizar el perfil");
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setIsEditing(false);
  };

  const handlePasswordReset = async () => {
    if (!currentPassword) {
      toast.error("Ingresa tu contraseña actual");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setSavingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setSavingPassword(false);
    if (result.ok) {
      setIsResettingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Contraseña actualizada correctamente");
    } else {
      toast.error("error" in result ? result.error : "No se pudo actualizar la contraseña");
    }
  };

  const handleCancelPasswordReset = () => {
    setIsResettingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Avatar & Name */}
      <div className="flex items-center gap-5 p-6 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm">
        <div className="relative group">
          <Avatar className="w-20 h-20 border-2 border-primary/20">
            <AvatarImage src={avatarUrl || undefined} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold font-sans tabular-nums">
              {name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-sans font-semibold text-foreground tabular-nums">{name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Administrador de la plataforma</p>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1.5">
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </Button>
        )}
      </div>

      {/* Info / Edit Form */}
      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm">
        {isEditing ? (
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="font-sans tabular-nums" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="font-sans tabular-nums" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Rol</Label>
              <Input value="Administrador" disabled className="opacity-60 font-sans tabular-nums" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={savingProfile} className="gap-1.5">
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={savingProfile} className="gap-1.5">
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            <div className="flex items-center gap-4 px-6 py-4">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="text-sm text-foreground font-medium font-sans tabular-nums">{name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-4">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-foreground font-medium font-sans tabular-nums">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-4">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Rol</p>
                <p className="text-sm text-foreground font-medium">Administrador</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Reset */}
      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between border-b border-border/20">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Contraseña</p>
              <p className="text-xs text-muted-foreground">Cambia tu contraseña de acceso</p>
            </div>
          </div>
          {!isResettingPassword && (
            <Button variant="outline" size="sm" onClick={() => setIsResettingPassword(true)} className="gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Cambiar
            </Button>
          )}
        </div>

        {isResettingPassword && (
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-muted-foreground">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-muted-foreground">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-muted-foreground">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handlePasswordReset} disabled={savingPassword} className="gap-1.5">
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Actualizando…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Actualizar
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancelPasswordReset} disabled={savingPassword} className="gap-1.5">
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
