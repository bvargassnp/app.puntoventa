function vitrinaShopClient()
{
    return {
        Cliente(
            {
                ID:rut,
                KUNNR:id,
                NAME1:name1,
                NAME2:name2,
                ZTERM:paymentCondition,
                STRAS:street,
                ORT01:ort01,
                REGIO:region,
                phone = 0,
                secondId = ""
            } = {}
        )
        {
            
            const cliente = 
            {
                rut,
                id,
                name1,
                name2,
                paymentCondition,
                street,
                ort01,
                region,
                phone,
                secondId,
                validate()
                {
                    return this.rut !== undefined &&
                    this.rut.length > 0 &&
                    this.rut !== "N/A" &&
                    this.name1 !== undefined &&
                    this.name1.length > 0 &&
                    this.name1 !== "N/A";
                }
            }

            return cliente;
        }
    }
}