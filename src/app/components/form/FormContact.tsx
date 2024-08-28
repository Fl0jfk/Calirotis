'use client';

import { useForm } from 'react-hook-form';
import { sendEmail } from '@/app/utils/send-email';

export type FormData = {
  name: string;
  email: string;
  message: string;
  telephone:string;
  numberInv:number;
  date:string;
  dateAMPM:string;
  location:string;
};

const [today] = new Date().toISOString().split('T')
const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }; 

function FormContact () {
    const { register, handleSubmit } = useForm<FormData>();
    function onSubmit(data: FormData) {
        const formattedDate = formatDate(data.date);
        const dataWithFormattedDate = { ...data, date: formattedDate };
        console.log(dataWithFormattedDate);
        sendEmail(dataWithFormattedDate);
      }
    return (
        <section className="flex items-center justify-center w-1/2 sm:w-full">
            <form onSubmit={handleSubmit(onSubmit)} name='form email' className='w-full'>
                <div className='mb-5'>
                    <label htmlFor='name' className='mb-3 block text-base font-medium'>
                        Votre nom et prénom
                    </label>
                    <input
                    autoComplete='name'
                    id='name'
                    type='text'
                    placeholder='Nom et prénom'
                    className='w-full rounded-full border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-black-500 focus:shadow-md text-black'
                    {...register('name', { required: true })}
                    />
                </div>
                <div className='mb-5'>
                    <label htmlFor='email' className='mb-3 block text-base font-medium'>
                        Votre adresse mail
                    </label>
                    <input
                        type='email'
                        id='email'
                        autoComplete='email'
                        placeholder='exemple@domaine.fr'
                        className='w-full rounded-full border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-black-500 focus:shadow-md text-black'
                        {...register('email', { required: true })}
                    />
                </div>
                <div className='mb-5'>
                    <label htmlFor='telephone' className='mb-3 block text-base font-medium'>Votre numéro de téléphone</label>
                    <input
                        type='tel'
                        id='telephone'
                        autoComplete='tel'
                        placeholder='0607080910'
                        pattern="^[0-9]{10}]$"
                        className='w-full rounded-full border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-black-500 focus:shadow-md text-black'
                        {...register('telephone', { required: true })}
                    />
                </div>
                <div className='mb-5'>
                    <label htmlFor='numberInv' className='mb-3 block text-base font-medium'>
                    Nombre d'invités
                    </label>
                    <input
                        type='number'
                        id='numberInv'
                        autoComplete='off'
                        placeholder="Indiquez le nombre d'invités prévus"
                        className='w-full resize-none rounded-full border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-black-500 focus:shadow-md text-black'
                        {...register('numberInv', { required: true })}
                    ></input>
                </div>
                <div className='mb-5'>
                    <label htmlFor='date' className='mb-3 block text-base font-medium'>
                    Date de l'évènement
                    </label>
                    <input
                        type='date'
                        id='date'
                        min={today}
                        autoComplete='off'
                        className='w-full resize-none rounded-full border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-black-500 focus:shadow-md text-black'
                        {...register('date', { required: true })}
                    ></input>
                </div>
                <div className='mb-5'>
                    <label htmlFor='dateAMPM' className='mb-3 block text-base font-medium'>
                    Midi ou soir
                    </label>
                    <select
                        id='dateAMPM'
                        autoComplete='off'
                        className='w-full resize-none rounded-full h-[50px] border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-black-500 focus:shadow-md text-black'
                        {...register('dateAMPM', { required: true })}
                    >
                        <option value="">Choissisez une option</option>
                        <option value="midi">Midi</option>
                        <option value="soir">Soir</option>
                    </select>
                </div>
                <div className='mb-5'>
                    <label htmlFor='location' className='mb-3 block text-base font-medium'>
                    Lieu de l'évènement
                    </label>
                    <textarea
                    rows={1}
                    id='location'
                    placeholder="Indiquez le lieu de l'évènement"
                    className='w-full resize-none rounded-full border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-black-500 focus:shadow-md text-black'
                    {...register('location', { required: true })}
                    ></textarea>
                </div>
                <div className='mb-5'>
                    <label htmlFor='message' className='mb-3 block text-base font-medium'>
                    Message
                    </label>
                    <textarea
                    rows={2}
                    id='message'
                    placeholder='Posez vos questions ou autres demandes ici'
                    className='w-full resize-none rounded-xl border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-black-500 focus:shadow-md text-black'
                    {...register('message', { required: true })}
                    ></textarea>
                </div>
                <div>
                    <button className='hover:shadow-form rounded-full border-[1px] border-[#ffffff8f] font-thin py-3 px-8 text-base uppercase text-white outline-none transition duration-300 ease-in-out hover:bg-white hover:text-black'>
                        Envoyer
                    </button>
                </div>
            </form>
        </section>
    );
};

export default FormContact;