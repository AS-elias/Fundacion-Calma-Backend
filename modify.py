import re

file_path = 'src/modules/dashboard/dashboard.service.ts'
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Replace block for desempenoPersonal calculation
old_block = '''    let desempenoPersonal: number | null = null;
    try {
      const userEvaluations = await this.prisma.<
        Array<{ rating: number }>
      >
        SELECT rating FROM core.director_evaluaciones WHERE usuario_id = 
      ;
      if (userEvaluations && userEvaluations.length > 0) {
        const sum = userEvaluations.reduce(
          (acc, curr) => acc + Number(curr.rating),
          0,
        );
        const avg = sum / userEvaluations.length;
        desempenoPersonal = Math.round((avg / 5) * 100);
      }
    } catch (err: any) {
      if (!(err?.code === 'P2010' && err?.meta?.code === '42703')) {
        throw err;
      }
      // Si la columna usuario_id no existe, no podemos calcular el desempeo personal
      desempenoPersonal = null;
    }'''

new_block = '''    let desempenoPersonal: number | null = null;
    let ultimaEvaluacion: { rating: number; comentario: string | null; created_at: Date } | null = null;
    try {
      const userEvaluations = await this.prisma.<
        Array<{ rating: number; comentario: string | null; created_at: Date }>
      >
        SELECT rating, comentario, created_at FROM core.director_evaluaciones WHERE usuario_id =  ORDER BY created_at DESC
      ;
      if (userEvaluations && userEvaluations.length > 0) {
        const sum = userEvaluations.reduce(
          (acc, curr) => acc + Number(curr.rating),
          0,
        );
        const avg = sum / userEvaluations.length;
        desempenoPersonal = Math.round((avg / 5) * 100);
        ultimaEvaluacion = userEvaluations[0];
      }
    } catch (err: any) {
      if (!(err?.code === 'P2010' && err?.meta?.code === '42703')) {
        throw err;
      }
      // Si la columna usuario_id no existe, no podemos calcular el desempeo personal
      desempenoPersonal = null;
    }'''

# Note: taking care of the encoding issue (desempeo -> desempeo / etc)
# Better to use regex for the old block to avoid exact string matching failure due to encoding
import re

pattern = re.compile(r'let desempenoPersonal.*?desempenoPersonal = null;\s*\}', re.DOTALL)
content = pattern.sub(new_block, content)

old_return = '''    return {
      misProyectos,
      totalProyectos: misProyectos,
      proyectosRegistrados: misProyectos,
      misConvenios,
      conveniosVigentes: misConvenios,
      desempenoEquipo,
      desempenoPersonal,
      actividadReciente,'''

new_return = '''    return {
      misProyectos,
      totalProyectos: misProyectos,
      proyectosRegistrados: misProyectos,
      misConvenios,
      conveniosVigentes: misConvenios,
      desempenoEquipo,
      desempenoPersonal,
      ultimaEvaluacion,
      actividadReciente,'''

content = content.replace(old_return, new_return)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
