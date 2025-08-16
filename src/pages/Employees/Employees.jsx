import { useState } from "react";
import EmployeeItem from "../../components/common/employes/EmployeeItem";
import ListContainer from "../../components/common/ListContainer";
import PageHeader from "../../components/common/PageHeader";
import PerfilModal from "../../components/common/modals/PerfilModal";

export default function Employees() {
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  const handleEdit = (funcionario) => {
    setUsuarioSelecionado(funcionario);
    setModalOpen(true);
  };

  const handleUpdate = (updatedUser) => {
    setFuncionarios((prev) =>
      prev.map((f) => (f.id === updatedUser.id ? updatedUser : f))
    );
  };

  const handleSearch = (value) => {
    console.log("Buscando por:", value);
  };

  const [funcionarios, setFuncionarios] = useState([
    {
      id: "42a1f06e-c351-4ec4-b234-6f78f1f1d9e2",
      nome: "Funcionario comum",
      email: "funcionariocomum@gmail.com",
      telefone: "(88) 9 9999-9999",
      perfil: "FUNCIONARIO_COMUM"
    },
    {
      id: "618a4d4c-4827-4ae7-abbc-dbb64b233890",
      nome: "Supervisor Junior",
      email: "supervisorjunior@gmail.com",
      telefone: "(88) 9 9999-9999",
      perfil: "SUPERVISOR_JUNIOR"
    },
     {
      id: "42a1f06e-c351-4ec4-b234-6f78f1f1d9ewe2",
      nome: "Funcionario comum",
      email: "funcionariocomum@gmail.com",
      telefone: "(88) 9 9999-9999",
      perfil: "FUNCIONARIO_COMUM"
    },
    {
      id: "618a4d4c-4827-4ae7-abbc-dbb64b23eweqsd3890",
      nome: "Supervisor Junior",
      email: "supervisorjunior@gmail.com",
      telefone: "(88) 9 9999-9999",
      perfil: "SUPERVISOR_JUNIOR"
    },
     {
      id: "42a1f06e-c351-4ec4-b234-6f78f1adqwrff1d9e2",
      nome: "Funcionario comum",
      email: "funcionariocomum@gmail.com",
      telefone: "(88) 9 9999-9999",
      perfil: "FUNCIONARIO_COMUM"
    },
    {
      id: "618a4d4c-4827-4ae7-abbcasdsf-dbb64b233890",
      nome: "Supervisor Junior",
      email: "supervisorjunior@gmail.com",
      telefone: "(88) 9 9999-9999",
      perfil: "SUPERVISOR_JUNIOR"
    }
  ]);

  const handlePromote = (funcionario) => {
    setFuncionarios((prev) =>
      prev.map((f) =>
        f.id === funcionario.id
          ? { ...f, perfil: "SUPERVISOR_JUNIOR" }
          : f
      )
    );
  };

  const handleDemote = (funcionario) => {
    setFuncionarios((prev) =>
      prev.map((f) =>
        f.id === funcionario.id
          ? { ...f, perfil: "FUNCIONARIO_COMUM" }
          : f
      )
    );
  };

  return (
    <div className="flex flex-col p-4 h-screen">
      <PageHeader
        title="Funcionários"
        searchPlaceholder="Digite o id ou nome do funcionário para encontrá-lo..."
        onSearch={handleSearch}
        showFilter
        showSort
      />

      <ListContainer height="100">
        {funcionarios.map((funcionario) => (
          <EmployeeItem
            key={funcionario.id}
            funcionario={funcionario}
            onPromote={() => handlePromote(funcionario)}
            onEdit={() => handleEdit(funcionario)}
            onDemote={() => handleDemote(funcionario)}
          />
        ))}
      </ListContainer>

    <PerfilModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      onSubmit={handleUpdate}
      initialData={usuarioSelecionado}
    />      
    </div>
  );
}
