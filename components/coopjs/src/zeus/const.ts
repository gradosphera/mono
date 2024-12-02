/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	AddTrustedAccountInput:{

	},
	BankAccountDetailsInput:{

	},
	BankAccountInput:{
		details:"BankAccountDetailsInput"
	},
	CreateBankAccountInput:{
		data:"BankAccountInput"
	},
	CreateBranchInput:{

	},
	DateTime: `scalar.DateTime` as const,
	DeletePaymentMethodInput:{

	},
	DeleteBranchInput:{

	},
	DeleteTrustedAccountInput:{

	},
	EditBranchInput:{

	},
	ExtensionInput:{
		config:"JSON",
		created_at:"DateTime",
		updated_at:"DateTime"
	},
	GetBranchesInput:{

	},
	GetExtensionsInput:{

	},
	GetPaymentMethodsInput:{

	},
	JSON: `scalar.JSON` as const,
	Mutation:{
		addTrustedAccount:{
			data:"AddTrustedAccountInput"
		},
		createBankAccount:{
			data:"CreateBankAccountInput"
		},
		createBranch:{
			data:"CreateBranchInput"
		},
		deleteBranch:{
			data:"DeleteBranchInput"
		},
		deletePaymentMethod:{
			data:"DeletePaymentMethodInput"
		},
		deleteTrustedAccount:{
			data:"DeleteTrustedAccountInput"
		},
		editBranch:{
			data:"EditBranchInput"
		},
		installExtension:{
			data:"ExtensionInput"
		},
		uninstallExtension:{
			data:"UninstallExtensionInput"
		},
		updateBankAccount:{
			data:"UpdateBankAccountInput"
		},
		updateExtension:{
			data:"ExtensionInput"
		}
	},
	Query:{
		getBranches:{
			data:"GetBranchesInput"
		},
		getExtensions:{
			data:"GetExtensionsInput"
		},
		getPaymentMethods:{
			data:"GetPaymentMethodsInput"
		}
	},
	UninstallExtensionInput:{

	},
	UpdateBankAccountInput:{
		data:"BankAccountInput"
	}
}

export const ReturnTypes: Record<string,any> = {
	BankAccount:{
		account_number:"String",
		bank_name:"String",
		card_number:"String",
		currency:"String",
		details:"BankAccountDetails"
	},
	BankAccountDetails:{
		bik:"String",
		corr:"String",
		kpp:"String"
	},
	BankPaymentMethod:{
		created_at:"DateTime",
		data:"BankAccount",
		is_default:"Boolean",
		method_id:"String",
		method_type:"String",
		updated_at:"DateTime",
		username:"String"
	},
	Branch:{
		bank_account:"BankPaymentMethod",
		braname:"String",
		city:"String",
		coopname:"String",
		country:"String",
		details:"OrganizationDetails",
		email:"String",
		fact_address:"String",
		full_address:"String",
		full_name:"String",
		phone:"String",
		represented_by:"RepresentedBy",
		short_name:"String",
		trusted:"Individual",
		trustee:"Individual",
		type:"String"
	},
	DateTime: `scalar.DateTime` as const,
	Extension:{
		available:"Boolean",
		config:"JSON",
		created_at:"DateTime",
		description:"String",
		enabled:"Boolean",
		image:"String",
		installed:"Boolean",
		instructions:"String",
		name:"String",
		readme:"String",
		schema:"JSON",
		tags:"String",
		title:"String",
		updated_at:"DateTime"
	},
	Individual:{
		birthdate:"String",
		email:"String",
		first_name:"String",
		full_address:"String",
		last_name:"String",
		middle_name:"String",
		passport:"Passport",
		phone:"String",
		username:"String"
	},
	JSON: `scalar.JSON` as const,
	Mutation:{
		addTrustedAccount:"Branch",
		createBankAccount:"PaymentMethod",
		createBranch:"Branch",
		deleteBranch:"Boolean",
		deletePaymentMethod:"Boolean",
		deleteTrustedAccount:"Branch",
		editBranch:"Branch",
		installExtension:"Extension",
		uninstallExtension:"Boolean",
		updateBankAccount:"PaymentMethod",
		updateExtension:"Extension"
	},
	OrganizationDetails:{
		inn:"String",
		kpp:"String",
		ogrn:"String"
	},
	PaginationResult:{
		currentPage:"Int",
		items:"PaymentMethod",
		totalCount:"Int",
		totalPages:"Int"
	},
	Passport:{
		code:"String",
		issued_at:"String",
		issued_by:"String",
		number:"Int",
		series:"Int"
	},
	PaymentMethod:{
		created_at:"DateTime",
		data:"PaymentMethodData",
		is_default:"Boolean",
		method_id:"String",
		method_type:"String",
		updated_at:"DateTime",
		username:"String"
	},
	PaymentMethodData:{
		"...on BankAccount":"BankAccount",
		"...on SbpAccount":"SbpAccount"
	},
	Query:{
		getBranches:"Branch",
		getExtensions:"Extension",
		getPaymentMethods:"PaginationResult"
	},
	RepresentedBy:{
		based_on:"String",
		first_name:"String",
		last_name:"String",
		middle_name:"String",
		position:"String"
	},
	SbpAccount:{
		phone:"String"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}