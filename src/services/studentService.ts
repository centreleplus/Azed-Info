export const deleteStudentFromDB = async (studentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/admin/students/${studentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || (data.success !== undefined && !data.success)) {
      throw new Error(data.message || data.msg || "Échec de la suppression dans la base de données.");
    }

    return true;
  } catch (error) {
    console.error("Erreur deleteStudentFromDB:", error);
    throw error;
  }
};
